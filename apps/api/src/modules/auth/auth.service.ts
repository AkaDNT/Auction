import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AppException } from 'src/common/errors/app.exception';

import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_CODES } from '@repo/shared';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  private accessToken(user: { id: string; role: string }) {
    const ttl = Number(process.env.JWT_ACCESS_TTL_SECONDS || 900);
    return this.jwt.sign(
      { sub: user.id, role: user.role },

      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: ttl,
      },
    );
  }

  private refreshToken(user: { id: string; role: string }, tokenId: string) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS || 7);
    return this.jwt.sign(
      { sub: user.id, tid: tokenId },

      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: `${days}d`,
      },
    );
  }

  async register(data: RegisterDto) {
    const { email, password, confirmPassword } = { ...data };
    if (confirmPassword !== password) {
      throw new AppException(
        {
          code: ERROR_CODES.PASSWORD_MISMATCH,
          message: 'Confirmation password does not match',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        name: email.substring(0, email.indexOf('@')),
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    const tokenRow = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: 'tmp',
        expiresAt: new Date(
          Date.now() +
            Number(process.env.JWT_REFRESH_TTL_DAYS!) * 60 * 60 * 24 * 1000,
        ),
      },
    });
    //sign refresh
    const refresh = this.refreshToken(
      { id: user.id, role: user.role },
      tokenRow.id,
    );

    //hash refresh
    const tokenHash = await bcrypt.hash(refresh, 10);

    //update token hash
    await this.prisma.refreshToken.update({
      where: {
        id: tokenRow.id,
      },
      data: {
        tokenHash,
      },
    });

    return {
      accessToken: this.accessToken({ id: user.id, role: user.role }),
      refreshToken: refresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );
    if (user.status !== 'ACTIVE')
      throw new AppException(
        { code: ERROR_CODES.AUTH_FORBIDDEN, message: 'User disabled' },
        HttpStatus.FORBIDDEN,
      );
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Invalid credentials',
        },
        HttpStatus.UNAUTHORIZED,
      );

    //create refresh row first to generate refresh id
    const tokenRow = await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: 'tmp',
        expiresAt: new Date(
          Date.now() +
            Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 60 * 60 * 24 * 1000,
        ),
      },
    });

    //sign refresh
    const refresh = this.refreshToken(
      { id: user.id, role: user.role },
      tokenRow.id,
    );

    //hash refresh
    const tokenHash = await bcrypt.hash(refresh, 10);

    //update token hash
    await this.prisma.refreshToken.update({
      where: {
        id: tokenRow.id,
      },
      data: {
        tokenHash,
      },
    });

    return {
      accessToken: this.accessToken({ id: user.id, role: user.role }),
      refreshToken: refresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    //verify refresh token
    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
    } catch {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_REFRESH_INVALID,
          message: 'Invalid refresh token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    //find refresh token in DB where revoked = null
    const tokenRow = await this.prisma.refreshToken.findFirst({
      where: {
        id: payload.tid,
        userId: payload.sub,
        revokedAt: null,
      },
      include: {
        user: true,
      },
    });
    if (!tokenRow) throw new UnauthorizedException('Refresh token revoked');
    const ok = await bcrypt.compare(refreshToken, tokenRow.tokenHash);
    if (!ok) throw new UnauthorizedException('Refresh token mismatch');
    if (tokenRow.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh token expired');

    //rotate: revoke old, issue new
    //revoke old
    await this.prisma.refreshToken.update({
      where: {
        id: tokenRow.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    //issue new
    const newRow = await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: 'tmp',
        expiresAt: new Date(
          Date.now() +
            Number(process.env.JWT_REFRESH_TTL_DAYS || 7) * 60 * 60 * 24 * 1000,
        ),
      },
    });

    const newRefreshToken = this.refreshToken(
      { id: tokenRow.userId, role: tokenRow.user.role },
      newRow.id,
    );
    const newHash = await bcrypt.hash(newRefreshToken, 10);

    await this.prisma.refreshToken.update({
      where: {
        id: newRow.id,
      },
      data: {
        tokenHash: newHash,
      },
    });
    return {
      accessToken: this.accessToken({
        id: tokenRow.userId,
        role: tokenRow.user.role,
      }),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET!,
      });
      await this.prisma.refreshToken.updateMany({
        where: {
          id: payload.tid,
          userId: payload.sub,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } catch {}
    return {
      ok: true,
    };
  }
}
