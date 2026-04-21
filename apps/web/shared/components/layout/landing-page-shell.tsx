"use client";

import { SiteHeader } from "@/features/landing/components/site-header";

type LandingPageShellProps = {
  children: React.ReactNode;
};

export function LandingPageShell({ children }: LandingPageShellProps) {
  return (
    <div className="min-h-screen text-foreground">
      <SiteHeader />
      <main>{children}</main>
    </div>
  );
}
