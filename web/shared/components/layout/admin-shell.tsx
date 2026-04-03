import type { ReactNode } from "react";

import Link from "next/link";

import { ThemeToggle } from "@/shared/components/theme/theme-toggle";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Lots", href: "/lots" },
  { label: "Users", href: "/users" },
  { label: "Settings", href: "/settings" },
];

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="theme-page min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6">
        <aside className="theme-surface flex flex-col rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6">
          <div className="border-b border-[color:var(--border)] pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Auction House
            </p>
            <p className="mt-2 text-sm theme-muted">Admin control center</p>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-w-max items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium theme-muted transition hover:border-[color:var(--border)] hover:bg-[color:var(--primary-soft)] hover:text-[color:var(--foreground)] lg:w-full"
              >
                <span>{item.label}</span>
                <span className="hidden text-xs uppercase tracking-[0.3em] theme-primary sm:inline">
                  Open
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto hidden border-t border-[color:var(--border)] pt-5 lg:block">
            <ThemeToggle />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <header className="theme-surface flex flex-col gap-4 rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
                Enterprise admin
              </p>
              <h1 className="mt-2 text-xl font-semibold theme-heading sm:text-2xl">
                Operational dashboard
              </h1>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </header>

          <div className="space-y-6 pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
