import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ERROR_CODES } from '@repo/shared';
import bcrypt from 'bcryptjs';
import { AppException } from 'src/common/errors/app.exception';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as profileRepository from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(profileRepository.PROFILE_REPOSITORY)
    private readonly profileRepo: profileRepository.IProfileRepository,
  ) {}

  async getMe(userId: string) {
    const user = await this.getExistingUser(userId);
    return this.toProfileResponse(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const current = await this.getExistingUser(userId);

    if (dto.slug && dto.slug !== current.slug) {
      const existedSlug = await this.profileRepo.findBySlug(dto.slug);

      if (existedSlug) {
        throw new AppException(
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Slug đã được sử dụng',
            details: { slug: dto.slug },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const user = await this.profileRepo.updateProfile(userId, {
      name: dto.name,
      slug: dto.slug,
    });

    return this.toProfileResponse(user);
  }

  async updateEmail(userId: string, dto: UpdateEmailDto) {
    const current = await this.assertPassword(userId, dto.password);

    if (dto.email === current.email) {
      return this.toProfileResponse(current);
    }

    const existedEmail = await this.profileRepo.findByEmail(dto.email);

    if (existedEmail) {
      throw new AppException(
        {
          code: ERROR_CODES.USER_EMAIL_ALREADY_EXISTS,
          message:
            'Email này đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.profileRepo.updateEmail(userId, dto.email);
    return this.toProfileResponse(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new AppException(
        {
          code: ERROR_CODES.PASSWORD_MISMATCH,
          message: 'Mật khẩu xác nhận không khớp',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.assertPassword(userId, dto.currentPassword);

    await this.profileRepo.updatePasswordHashAndRevokeRefreshTokens(
      userId,
      await bcrypt.hash(dto.newPassword, 10),
    );

    return { ok: true };
  }

  private async getExistingUser(userId: string) {
    const user = await this.profileRepo.findById(userId);

    if (!user) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_FORBIDDEN,
          message: 'Không tìm thấy người dùng',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  private async assertPassword(userId: string, password: string) {
    const user = await this.getExistingUser(userId);
    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
          message: 'Mật khẩu không đúng',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  private toProfileResponse(user: profileRepository.ProfileUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      slug: user.slug,
      status: user.status,
      roles: user.userRoles.map((item) => item.role),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
