"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthGuardSkeleton } from "@/features/auth/components/auth-guard-skeleton";
import {
  getRoleLandingPath,
  hasRole,
} from "@/features/auth/services/auth-routing";
import { getCurrentUser } from "@/features/auth/services/auth-session.service";

type AdminRouteGuardProps = {
  children: React.ReactNode;
};

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      setIsReady(false);

      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        if (!hasRole(currentUser.roles, "ADMIN")) {
          router.replace(getRoleLandingPath(currentUser.roles));
          return;
        }

        setIsReady(true);
      } catch {
        if (!isMounted) {
          return;
        }

        const nextPath = pathname || "/admin/dashboard";
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      }
    }

    void checkAuth();

    const handlePageShow = () => {
      void checkAuth();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, router]);

  if (!isReady) {
    return <AuthGuardSkeleton />;
  }

  return <>{children}</>;
}
