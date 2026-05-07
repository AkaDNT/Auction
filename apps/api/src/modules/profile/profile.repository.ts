import { Prisma } from '@prisma/client';

export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export type ProfileUser = Prisma.UserGetPayload<{
  include: {
    userRoles: true;
  };
}>;

export interface IProfileRepository {
  findById(id: string): Promise<ProfileUser | null>;
  findByEmail(email: string): Promise<ProfileUser | null>;
  findBySlug(slug: string): Promise<ProfileUser | null>;

  updateProfile(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
    }>,
  ): Promise<ProfileUser>;

  updateEmail(id: string, email: string): Promise<ProfileUser>;
  updatePasswordHashAndRevokeRefreshTokens(
    id: string,
    passwordHash: string,
  ): Promise<void>;
}
