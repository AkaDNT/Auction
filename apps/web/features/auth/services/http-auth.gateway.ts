import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import type { AuthGateway } from "@/features/auth/services/auth-gateway";
import type {
  ApiErrorShape,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/features/auth/types/auth";

export class HttpAuthGateway implements AuthGateway {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await authHttpFetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json().catch(() => null)) as
      | RegisterResponse
      | ApiErrorShape
      | null;

    if (!response.ok) {
      const error = (json as ApiErrorShape | null)?.error;
      throw new AuthApiError(
        error?.message ?? "Đăng ký thất bại, vui lòng thử lại",
        response.status,
        error?.code,
        error?.details,
      );
    }

    return json as RegisterResponse;
  }

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await authHttpFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json().catch(() => null)) as
      | LoginResponse
      | ApiErrorShape
      | null;

    if (!response.ok) {
      const error = (json as ApiErrorShape | null)?.error;
      throw new AuthApiError(
        error?.message ?? "Đăng nhập thất bại, vui lòng thử lại",
        response.status,
        error?.code,
        error?.details,
      );
    }

    return json as LoginResponse;
  }
}
