import { AuthApiError } from "@/features/auth/services/auth-api.error";

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
