import type { ReactNode } from "react";

import { SellerRouteGuard } from "@/features/auth/components/seller-route-guard";
import { SellerShell } from "@/shared/components/layout/seller-shell";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <SellerRouteGuard>
      <SellerShell>{children}</SellerShell>
    </SellerRouteGuard>
  );
}
