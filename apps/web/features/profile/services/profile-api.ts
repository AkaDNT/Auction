import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import type { ApiErrorShape } from "@/features/auth/types/auth";
import type {
  EmailFormState,
  PasswordFormState,
  ProfileFormState,
  ProfileUser,
} from "@/features/profile/types/profile";

async function parseJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

async function readProfileError(response: Response, fallback: string) {
  const json = await parseJson<ApiErrorShape>(response);
  const error = json?.error;

  return new AuthApiError(
    error?.message ?? fallback,
    response.status,
    error?.code,
    error?.details,
  );
}

export async function getMyProfile(): Promise<ProfileUser> {
  const response = await authHttpFetch("/profile/me", { method: "GET" });
  const json = await parseJson<{ user?: ProfileUser } | ApiErrorShape>(
    response,
  );

  if (!response.ok || !json || !("user" in json) || !json.user) {
    throw await readProfileError(response, "Không thể tải thông tin hồ sơ.");
  }

  return json.user;
}

export async function updateMyProfile(
  payload: ProfileFormState,
): Promise<ProfileUser> {
  const response = await authHttpFetch("/profile/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await parseJson<{ user?: ProfileUser } | ApiErrorShape>(
    response,
  );

  if (!response.ok || !json || !("user" in json) || !json.user) {
    throw await readProfileError(response, "Không thể cập nhật hồ sơ.");
  }

  return json.user;
}

export async function updateEmail(
  payload: EmailFormState,
): Promise<ProfileUser> {
  const response = await authHttpFetch("/profile/email", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await parseJson<{ user?: ProfileUser } | ApiErrorShape>(
    response,
  );

  if (!response.ok || !json || !("user" in json) || !json.user) {
    throw await readProfileError(response, "Không thể cập nhật email.");
  }

  return json.user;
}

export async function changePassword(
  payload: PasswordFormState,
): Promise<void> {
  const response = await authHttpFetch("/profile/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await readProfileError(response, "Không thể đổi mật khẩu.");
  }
}
