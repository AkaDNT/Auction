import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import {
  clearAuthUser,
  getAuthUser,
  setAuthUser,
} from "@/features/auth/services/auth-user.store";
import { clearAuthAccessToken } from "@/features/auth/services/auth-token.store";
import type { ApiErrorShape, AuthUser } from "@/features/auth/types/auth";

let currentUserRequest: Promise<AuthUser> | null = null;

export async function getCurrentUser(): Promise<AuthUser> {
  const cachedUser = getAuthUser();
  if (cachedUser) {
    return cachedUser;
  }

  if (!currentUserRequest) {
    currentUserRequest = (async () => {
      const response = await authHttpFetch("/auth/me", {
        method: "GET",
      });

      const json = (await response.json().catch(() => null)) as
        | { user?: AuthUser }
        | ApiErrorShape
        | null;

      if (!response.ok || !json || !("user" in json) || !json.user) {
        const error = (json as ApiErrorShape | null)?.error;
        throw new AuthApiError(
          error?.message ?? "Không thể lấy thông tin người dùng",
          response.status,
          error?.code,
          error?.details,
        );
      }

      setAuthUser(json.user);
      return json.user;
    })().finally(() => {
      currentUserRequest = null;
    });
  }

  return currentUserRequest;
}

export async function ensureAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch {
    clearAuthAccessToken();
    clearAuthUser();
    return false;
  }
}

export async function logoutSession(): Promise<void> {
  try {
    await authHttpFetch("/auth/logout", {
      method: "POST",
    });
  } finally {
    clearAuthAccessToken();
    clearAuthUser();
  }
}
