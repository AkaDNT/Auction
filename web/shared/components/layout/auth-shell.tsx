import type { ReactNode } from "react";

import { ThemeToggle } from "@/shared/components/theme/theme-toggle";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="theme-page min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-6 sm:gap-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Auction House
            </p>
            <p className="mt-2 text-sm theme-muted">{description}</p>
          </div>
          <ThemeToggle />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8">
          <div className="max-w-xl">
            <span className="theme-eyebrow">Secure access</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight theme-heading sm:mt-5 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 theme-muted sm:mt-5 sm:text-lg">
              The same theme system carries through authentication so the
              product feels unified from public entry points to private
              operations.
            </p>
          </div>

          <div className="theme-surface rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
