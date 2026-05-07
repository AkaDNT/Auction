import {
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AppException } from 'src/common/errors/app.exception';

import { ERROR_CODES } from '@repo/shared';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import * as authRepository from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authRepository.AUTH_REPOSITORY)
    private readonly authRepo: authRepository.IAuthRepository,
    private jwt: JwtService,
  ) {}

  private accessToken(user: { id: string; roles: string[] }) {
    const ttl = Number(process.env.JWT_ACCESS_TTL_SECONDS || 900);
    return this.jwt.sign(
      { sub: user.id, roles: user.roles },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: ttl,
      },
    );
  }

  private refreshToken(user: { id: string }, tokenId: string) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS || 7);
    return this.jwt.sign(
      { sub: user.id, tid: tokenId },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: `${days}d`,
      },
    );
  }

  private async generateUserSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, { lower: true, strict: true, locale: 'vi' });

    const existedBase = await this.authRepo.findUserBySlug(baseSlug);
    if (!existedBase) return baseSlug;

    return `${baseSlug}-${nanoid(4)}`;
  }

  async register(data: RegisterDto) {
    const { email, password, confirmPassword } = { ...data };

    if (confirmPassword !== password) {
      throw new AppException(
        {
          code: ERROR_CODES.PASSWORD_MISMATCH,
          message: 'Mật khẩu xác nhận không khớp',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const existed = await this.authRepo.findUserByEmailWithRoles(email);
    if (existed) {
      throw new AppException(
        {
          code: ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
          message:
            'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.authRepo.createUser({
      email,
      name: data.name,
      passwordHash: await bcrypt.hash(password, 10),
      slug: await this.generateUserSlug(data.name),
      role: Role.USER,
    });

    const roles = user.userRoles.map((item) => item.role);

    const tokenRow = await this.authRepo.createRefreshToken({
      userId: user.id,
      tokenHash: 'tmp',
      expiresAt: new Date(
        Date.now() +
          Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 60 * 60 * 24 * 1000,
      ),
    });

    const refresh = this.refreshToken({ id: user.id }, tokenRow.id);
    const tokenHash = await bcrypt.hash(refresh, 10);

    await this.authRepo.updateRefreshTokenHash(tokenRow.id, tokenHash);

    return {
      accessToken: this.accessToken({ id: user.id, roles }),
      refreshToken: refresh,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        slug: user.slug,
        roles,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.authRepo.findUserByEmailWithRoles(email);

    if (!user) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Thông tin đăng nhập không hợp lệ',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_FORBIDDEN,
          message: 'Tài khoản hiện không hoạt động',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Thông tin đăng nhập không hợp lệ',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const roles = user.userRoles.map((item) => item.role);

    const tokenRow = await this.authRepo.createRefreshToken({
      userId: user.id,
      tokenHash: 'tmp',
      expiresAt: new Date(
        Date.now() +
          Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 60 * 60 * 24 * 1000,
      ),
    });

    const refresh = this.refreshToken({ id: user.id }, tokenRow.id);
    const tokenHash = await bcrypt.hash(refresh, 10);

    await this.authRepo.updateRefreshTokenHash(tokenRow.id, tokenHash);

    return {
      accessToken: this.accessToken({ id: user.id, roles }),
      refreshToken: refresh,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;

    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_REFRESH_INVALID,
          message: 'Refresh token không hợp lệ',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokenRow = await this.authRepo.findActiveRefreshTokenWithUser({
      id: payload.tid,
      userId: payload.sub,
    });

    if (!tokenRow) {
      throw new UnauthorizedException('Refresh token đã bị thu hồi');
    }

    const ok = await bcrypt.compare(refreshToken, tokenRow.tokenHash);
    if (!ok) {
      throw new UnauthorizedException('Refresh token không khớp');
    }

    if (tokenRow.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token đã hết hạn');
    }

    await this.authRepo.revokeRefreshToken(tokenRow.id);

    const newRow = await this.authRepo.createRefreshToken({
      userId: payload.sub,
      tokenHash: 'tmp',
      expiresAt: new Date(
        Date.now() +
          Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 60 * 60 * 24 * 1000,
      ),
    });

    const roles = tokenRow.user.userRoles.map((item) => item.role);

    const newRefreshToken = this.refreshToken(
      { id: tokenRow.userId },
      newRow.id,
    );

    const newHash = await bcrypt.hash(newRefreshToken, 10);

    await this.authRepo.updateRefreshTokenHash(newRow.id, newHash);

    return {
      accessToken: this.accessToken({
        id: tokenRow.userId,
        roles,
      }),
      refreshToken: newRefreshToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.authRepo.findUserByIdWithRoles(userId);

    if (!user) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_FORBIDDEN,
          message: 'Không tìm thấy người dùng',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.userRoles.map((item) => item.role),
    };
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });

      await this.authRepo.revokeActiveRefreshToken({
        id: payload.tid,
        userId: payload.sub,
      });
    } catch {}

    return { ok: true };
  }
}
