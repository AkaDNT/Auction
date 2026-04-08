import type {
  RegisterRequest,
  RegisterSnapshot,
} from "@/features/auth/types/auth";

export interface AuthSessionStorage {
  saveRegisterSnapshot(payload: RegisterRequest): void;
}

export class LocalAuthSessionStorage implements AuthSessionStorage {
  static readonly REGISTER_SNAPSHOT_KEY = "auction.auth.register.snapshot";

  saveRegisterSnapshot(payload: RegisterRequest): void {
    if (typeof window === "undefined") {
      return;
    }

    const snapshot: RegisterSnapshot = {
      payload: {
        email: payload.email,
        name: payload.name,
      },
      savedAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(
      LocalAuthSessionStorage.REGISTER_SNAPSHOT_KEY,
      JSON.stringify(snapshot),
    );
  }
}
