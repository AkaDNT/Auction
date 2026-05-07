import { Prisma, Role } from '@prisma/client';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export type AuthUserWithRoles = Prisma.UserGetPayload<{
  include: {
    userRoles: true;
  };
}>;

export type AuthRefreshTokenWithUserRoles = Prisma.RefreshTokenGetPayload<{
  include: {
    user: {
      include: {
        userRoles: true;
      };
    };
  };
}>;

export interface IAuthRepository {
  findUserByEmailWithRoles(email: string): Promise<AuthUserWithRoles | null>;
  findUserByIdWithRoles(id: string): Promise<AuthUserWithRoles | null>;
  findUserBySlug(slug: string): Promise<{ id: string } | null>;

  createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    slug: string;
    role: Role;
  }): Promise<AuthUserWithRoles>;

  createRefreshToken(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string }>;

  updateRefreshTokenHash(id: string, tokenHash: string): Promise<void>;

  findActiveRefreshTokenWithUser(params: {
    id: string;
    userId: string;
  }): Promise<AuthRefreshTokenWithUserRoles | null>;

  revokeRefreshToken(id: string): Promise<void>;

  revokeActiveRefreshToken(params: {
    id: string;
    userId: string;
  }): Promise<void>;
}
