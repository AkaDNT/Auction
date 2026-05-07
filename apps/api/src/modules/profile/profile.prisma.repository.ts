import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IProfileRepository, ProfileUser } from './profile.repository';

@Injectable()
export class ProfilePrismaRepository implements IProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<ProfileUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });
  }

  findByEmail(email: string): Promise<ProfileUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: true,
      },
    });
  }

  findBySlug(slug: string): Promise<ProfileUser | null> {
    return this.prisma.user.findUnique({
      where: { slug },
      include: {
        userRoles: true,
      },
    });
  }

  updateProfile(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
    }>,
  ): Promise<ProfileUser> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        userRoles: true,
      },
    });
  }

  updateEmail(id: string, email: string): Promise<ProfileUser> {
    return this.prisma.user.update({
      where: { id },
      data: { email },
      include: {
        userRoles: true,
      },
    });
  }

  async updatePasswordHashAndRevokeRefreshTokens(
    id: string,
    passwordHash: string,
  ): Promise<void> {
    const revokedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id },
        data: { passwordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId: id,
          revokedAt: null,
        },
        data: {
          revokedAt,
        },
      }),
    ]);
  }
}
