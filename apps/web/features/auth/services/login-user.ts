import type { AuthGateway } from "@/features/auth/services/auth-gateway";
import { HttpAuthGateway } from "@/features/auth/services/http-auth.gateway";
import type { LoginRequest, LoginResponse } from "@/features/auth/types/auth";

const defaultAuthGateway = new HttpAuthGateway();

export async function loginUser(
  payload: LoginRequest,
  gateway: AuthGateway = defaultAuthGateway,
): Promise<LoginResponse> {
  return gateway.login(payload);
}
