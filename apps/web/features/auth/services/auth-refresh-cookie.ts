"use client";

export const REFRESH_TOKEN_MARKER_COOKIE = "refresh_token_present";

export function hasRefreshTokenCookie(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie
    .split(";")
    .some((cookie) => cookie.trim().startsWith(`${REFRESH_TOKEN_MARKER_COOKIE}=`));
}

export function clearRefreshTokenCookieMarker(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${REFRESH_TOKEN_MARKER_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
