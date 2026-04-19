"use client";

import { useEffect } from "react";

import { getCurrentUser } from "@/features/auth/services/auth-session.service";
import { getAuthUser } from "@/features/auth/services/auth-user.store";

export function AuthSessionBootstrap() {
  useEffect(() => {
    if (getAuthUser()) {
      return;
    }

    void getCurrentUser().catch(() => {
      // Ignore bootstrap failures: unauthenticated users should remain in logged-out UI.
    });
  }, []);

  return null;
}
