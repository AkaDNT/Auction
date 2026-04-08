import type { AuthGateway } from "@/features/auth/services/auth-gateway";
import { HttpAuthGateway } from "@/features/auth/services/http-auth.gateway";
import type {
  RegisterRequest,
  RegisterResponse,
} from "@/features/auth/types/auth";

const defaultAuthGateway = new HttpAuthGateway();

export async function registerUser(
  payload: RegisterRequest,
  gateway: AuthGateway = defaultAuthGateway,
): Promise<RegisterResponse> {
  return gateway.register(payload);
}
