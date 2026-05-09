"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { setAuthUser } from "@/features/auth/services/auth-user.store";
import { getMyProfile } from "@/features/profile/services/profile-api";
import { toUserStorePayload } from "@/features/profile/services/profile-user-store";

export function useProfileData() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    retry: false,
  });
  const profile = profileQuery.data ?? null;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAuthUser(toUserStorePayload(profile));
  }, [profile]);

  useEffect(() => {
    if (profileQuery.error instanceof AuthApiError) {
      if (profileQuery.error.status === 401) {
        router.replace(`/login?next=${encodeURIComponent("/profile")}`);
      }
    }
  }, [profileQuery.error, router]);

  return {
    profile,
    profileQuery,
    queryClient,
    router,
    isBooting: profileQuery.isLoading || profileQuery.isFetching,
  };
}
