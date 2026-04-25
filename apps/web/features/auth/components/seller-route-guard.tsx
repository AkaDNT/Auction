"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthGuardSkeleton } from "@/features/auth/components/auth-guard-skeleton";
import { hasRefreshTokenCookie } from "@/features/auth/services/auth-refresh-cookie";
import {
  getRoleLandingPath,
  hasRole,
} from "@/features/auth/services/auth-routing";
import { getCurrentUser } from "@/features/auth/services/auth-session.service";

type SellerRouteGuardProps = {
  children: React.ReactNode;
};

export function SellerRouteGuard({ children }: SellerRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      setIsReady(false);

      if (!hasRefreshTokenCookie()) {
        const nextPath = pathname || "/seller";
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) {
          return;
        }

        if (!hasRole(currentUser.roles, "SELLER")) {
          router.replace(getRoleLandingPath(currentUser.roles));
          return;
        }

        setIsReady(true);
      } catch {
        if (!isMounted) {
          return;
        }

        const nextPath = pathname || "/seller";
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
