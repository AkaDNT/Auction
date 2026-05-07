import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuthRefreshTokenWithUserRoles,
  AuthUserWithRoles,
  IAuthRepository,
} from './auth.repository';

@Injectable()
export class AuthPrismaRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmailWithRoles(email: string): Promise<AuthUserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: true,
      },
    });
  }

  findUserByIdWithRoles(id: string): Promise<AuthUserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });
  }

  findUserBySlug(slug: string): Promise<{ id: string } | null> {
    return this.prisma.user.findUnique({
      where: { slug },
      select: {
        id: true,
      },
    });
  }

  createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    slug: string;
    role: Role;
  }): Promise<AuthUserWithRoles> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        slug: data.slug,
        userRoles: {
          create: [{ role: data.role }],
        },
        wallet: {
          create: {},
        },
      },
      include: {
        userRoles: true,
      },
    });
  }

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string }> {
    return this.prisma.refreshToken.create({
      data,
      select: {
        id: true,
      },
    });
  }

  async updateRefreshTokenHash(id: string, tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { tokenHash },
    });
  }

  findActiveRefreshTokenWithUser(params: {
    id: string;
    userId: string;
  }): Promise<AuthRefreshTokenWithUserRoles | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        id: params.id,
        userId: params.userId,
        revokedAt: null,
      },
      include: {
        user: {
          include: {
            userRoles: true,
          },
        },
      },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeActiveRefreshToken(params: {
    id: string;
    userId: string;
  }): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        id: params.id,
        userId: params.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
