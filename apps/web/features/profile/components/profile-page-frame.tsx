"use client";

import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";

import { useProfileData } from "@/features/profile/hooks/use-profile-data";
import { getErrorMessage } from "@/features/profile/utils/profile-error";

type ProfilePageFrameProps = {
  title: string;
  description: string;
  profileQuery: ReturnType<typeof useProfileData>["profileQuery"];
  children: ReactNode;
};

export function ProfilePageFrame({
  title,
  description,
  profileQuery,
  children,
}: ProfilePageFrameProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-4xl theme-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-theme-brand/60 to-transparent" />
        <div className="pointer-events-none absolute -left-28 top-16 h-56 w-56 rounded-full bg-theme-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-52 w-52 rounded-full bg-theme-brand/10 blur-3xl" />

        <div className="relative space-y-6">
          <header className="flex flex-col gap-5 border-b border-theme-line pb-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
                Hồ sơ cá nhân
              </p>
              <h1 className="font-display text-3xl font-semibold leading-tight text-theme-heading sm:text-4xl lg:text-[2.65rem]">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-theme-muted sm:text-base">
                {description}
              </p>
            </div>
          </header>

          {profileQuery.isError ? (
            <section className="rounded-xl border border-red-300/40 bg-red-50/60 p-4 text-sm text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
              {getErrorMessage(
                profileQuery.error,
                "Không thể tải thông tin hồ sơ.",
              )}
            </section>
          ) : null}

          {children}
        </div>
      </div>
    </section>
  );
}
