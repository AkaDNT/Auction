"use client";

import { ProfileNavbar } from "@/features/auction/components/profile-navbar";
import { ProfileSidebar } from "@/shared/components/layout/profile-sidebar";
import type { ReactNode } from "react";
import { useState } from "react";

type ProfileLayoutProps = {
  children: ReactNode;
};

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="theme-page relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--glow),transparent_38%)]" />

      <div className="relative text-theme-body">
        <ProfileNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex min-h-[calc(100vh-5rem)] items-start justify-center gap-1 lg:mr-16">
          <ProfileSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <main className="min-w-0 w-full max-w-6xl">{children}</main>
        </div>
      </div>
    </div>
  );
}
