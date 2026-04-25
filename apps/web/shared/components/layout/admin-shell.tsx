"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import { AuthUserMenu } from "@/features/auth/components/auth-user-menu";
import { ThemeToggle } from "@/shared/components/theme/theme-toggle";
import { mockImages } from "@/shared/lib/mock-images";

const navigation = [
  { label: "Tổng quan", href: "/admin/dashboard" },
  { label: "Phân tích", href: "/admin/dashboard/analytics" },
  { label: "Phiên đấu giá", href: "/admin/auctions" },
  { label: "Danh mục", href: "/admin/categories" },
  { label: "Nội dung", href: "/admin/content" },
  { label: "Lượt đặt giá", href: "/admin/bids" },
  { label: "Người dùng", href: "/admin/users" },
  { label: "Cài đặt", href: "/admin/settings" },
];

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="theme-page min-h-screen">
      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          role="presentation"
        />
      ) : null}

      <div className="mx-auto grid min-h-screen max-w-7xl gap-3 px-2 py-2 sm:gap-4 sm:px-3 sm:py-3 md:gap-5 md:px-4 md:py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6">
        <aside
          className={`theme-surface fixed left-0 top-0 z-50 flex h-screen w-[80vw] flex-col overflow-y-auto rounded-2xl p-3 transition-transform duration-300 ease-in-out sm:w-75 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:relative lg:left-auto lg:top-auto lg:z-auto lg:h-auto lg:w-auto lg:translate-x-0 lg:overflow-visible lg:rounded-4xl lg:p-6 lg:transition-none ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-(--primary-soft) lg:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>

          <div className="border-b border-(--border) pb-3 sm:pb-4 md:pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
              Sàn Đấu Giá
            </p>
            <p className="mt-1 text-xs theme-muted sm:mt-2 sm:text-sm">
              Trung tâm điều hành quản trị
            </p>
          </div>

          <nav className="mt-4 flex flex-col gap-1.5 sm:mt-5 lg:mt-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm lg:w-full lg:rounded-2xl lg:px-4 lg:py-3 ${
                  isActive(item.href)
                    ? "border-(--border) bg-(--primary-soft) text-foreground"
                    : "border-transparent theme-muted hover:border-(--border) hover:bg-(--primary-soft) hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                <span className="hidden text-xs uppercase tracking-[0.3em] theme-primary sm:inline">
                  Mở
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-(--border) p-3 lg:block">
            <div className="relative h-32 overflow-hidden rounded-xl border border-(--border)">
              <Image
                src={mockImages.adminPanel}
                alt="Bảng điều khiển quản trị"
                fill
                className="object-cover"
                sizes="260px"
              />
            </div>
            <p className="mt-3 text-xs leading-5 theme-muted">
              Hình ảnh mock từ nguồn public. Khi có backend, thay URL bằng ảnh
              AWS S3 tại tầng dữ liệu.
            </p>
          </div>

          <div className="mt-auto hidden border-t border-(--border) pt-5 lg:block">
            <ThemeToggle />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <header className="theme-surface flex items-center justify-between gap-3 rounded-2xl p-3 sm:rounded-3xl sm:gap-4 sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-lg p-1.5 transition hover:bg-(--primary-soft) lg:hidden"
                aria-label="Open sidebar"
              >
                <MenuIcon />
              </button>
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-foreground sm:gap-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--primary-soft) text-sm font-bold tracking-[0.3em] text-(--primary-strong) sm:h-11 sm:w-11">
                  AH
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
                    Quản trị doanh nghiệp
                  </p>
                  <p className="hidden text-xs theme-muted sm:block">
                    Bảng điều khiển vận hành
                  </p>
                </div>
              </Link>
            </div>
            <div className="shrink-0">
              <AuthUserMenu />
            </div>
          </header>

          <div className="space-y-6 pb-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
