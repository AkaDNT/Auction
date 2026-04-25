import {
  clearAuthAccessToken,
  getAuthAccessToken,
  setAuthAccessToken,
} from "@/features/auth/services/auth-token.store";
import {
  clearRefreshTokenCookieMarker,
  hasRefreshTokenCookie,
} from "@/features/auth/services/auth-refresh-cookie";

type RefreshResponse = {
  accessToken: string;
};

const AUTH_PATHS_WITHOUT_REFRESH = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh",
  "/auth/logout",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3999";

async function clearRefreshTokenCookie(): Promise<void> {
  clearRefreshTokenCookieMarker();

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
  if (!hasRefreshTokenCookie()) {
    clearAuthAccessToken();
    return null;
  }

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

function shouldSkipRefresh(path: string): boolean {
  return AUTH_PATHS_WITHOUT_REFRESH.some((authPath) =>
    path.startsWith(authPath),
  );
}

export async function authHttpFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const skipRefresh = shouldSkipRefresh(path);
  let token = getAuthAccessToken();

  // After page reload, access token in memory is empty. Refresh first to avoid
  // an initial 401 on protected endpoints such as /auth/me.
  if (!token && !skipRefresh) {
    if (!hasRefreshTokenCookie()) {
      return new Response(null, { status: 401 });
    }

    token = await refreshAccessToken();
  }

  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status !== 401 || skipRefresh) {
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
