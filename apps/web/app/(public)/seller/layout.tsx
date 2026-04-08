import type { ReactNode } from "react";

import { SellerRouteGuard } from "@/features/auth/components/seller-route-guard";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return <SellerRouteGuard>{children}</SellerRouteGuard>;
}
