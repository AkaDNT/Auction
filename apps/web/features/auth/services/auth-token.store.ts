let accessToken: string | null = null;

export function setAuthAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAuthAccessToken(): string | null {
  return accessToken;
}

export function clearAuthAccessToken(): void {
  accessToken = null;
}
