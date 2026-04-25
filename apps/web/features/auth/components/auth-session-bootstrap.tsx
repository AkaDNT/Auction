"use client";

import { useEffect } from "react";

import { getCurrentUser } from "@/features/auth/services/auth-session.service";
import { hasRefreshTokenCookie } from "@/features/auth/services/auth-refresh-cookie";
import { getAuthUser } from "@/features/auth/services/auth-user.store";

export function AuthSessionBootstrap() {
  useEffect(() => {
    if (getAuthUser() || !hasRefreshTokenCookie()) {
      return;
    }

    void getCurrentUser().catch(() => {
      // Ignore bootstrap failures: unauthenticated users should remain in logged-out UI.
    });
  }, []);

  return null;
}
