import type { ProfileUser } from "@/features/profile/types/profile";

export function toUserStorePayload(user: ProfileUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  };
}
