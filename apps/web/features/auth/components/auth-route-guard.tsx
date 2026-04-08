"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthGuardSkeleton } from "@/features/auth/components/auth-guard-skeleton";
import { getRoleLandingPath } from "@/features/auth/services/auth-routing";
import { getCurrentUser } from "@/features/auth/services/auth-session.service";

type AuthRouteGuardProps = {
  children: React.ReactNode;
};

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const router = useRouter();
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

        router.replace(getRoleLandingPath(currentUser.roles));
        return;
      } catch {
        if (!isMounted) {
          return;
        }

        setIsReady(true);
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
  }, [router]);

  if (!isReady) {
    return <AuthGuardSkeleton />;
  }

  return <>{children}</>;
}
