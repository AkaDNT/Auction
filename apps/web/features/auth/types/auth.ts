export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
};

export type CurrentUser = {
  id: string;
  roles: string[];
};

export type RegisterResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterSnapshotPayload = {
  email: string;
  name: string;
};

export type RegisterSnapshot = {
  payload: RegisterSnapshotPayload;
  savedAt: string;
};

export type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};
