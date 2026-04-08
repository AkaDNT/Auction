import type { ReactNode } from "react";
import { AuthRouteGuard } from "@/features/auth/components/auth-route-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthRouteGuard>{children}</AuthRouteGuard>;
}
