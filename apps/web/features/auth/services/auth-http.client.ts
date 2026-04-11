import {
  clearAuthAccessToken,
  getAuthAccessToken,
  setAuthAccessToken,
} from "@/features/auth/services/auth-token.store";

type RefreshResponse = {
  accessToken: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3999";

async function clearRefreshTokenCookie(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Ignore cleanup failure because auth flow can still continue as logged-out.
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).catch(() => null);

  if (!response) {
    clearAuthAccessToken();
    await clearRefreshTokenCookie();
    return null;
  }

  if (!response.ok) {
    clearAuthAccessToken();
    await clearRefreshTokenCookie();
    return null;
  }

  const data = (await response
    .json()
    .catch(() => null)) as RefreshResponse | null;
  const token = data?.accessToken ?? null;

  if (token) {
    setAuthAccessToken(token);
    return token;
  }

  clearAuthAccessToken();
  await clearRefreshTokenCookie();
  return null;
}

export async function authHttpFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAuthAccessToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return response;
  }

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: retryHeaders,
    credentials: "include",
  });
}
