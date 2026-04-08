import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/features/auth/types/auth";

export interface AuthGateway {
  register(payload: RegisterRequest): Promise<RegisterResponse>;
  login(payload: LoginRequest): Promise<LoginResponse>;
}
