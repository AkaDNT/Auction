import type { ReactNode } from "react";

import { AdminRouteGuard } from "@/features/auth/components/admin-route-guard";
import { AdminShell } from "@/shared/components/layout/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRouteGuard>
  );
}
