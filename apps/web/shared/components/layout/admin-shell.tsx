import type { ReactNode } from "react";

import Link from "next/link";
import Image from "next/image";

import { ThemeToggle } from "@/shared/components/theme/theme-toggle";
import { mockImages } from "@/shared/lib/mock-images";

const navigation = [
  { label: "Tổng quan", href: "/dashboard" },
  { label: "Phân tích", href: "/dashboard/analytics" },
  { label: "Lô hàng", href: "/lots" },
  { label: "Người dùng", href: "/users" },
  { label: "Cài đặt", href: "/settings" },
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
              Sàn Đấu Giá
            </p>
            <p className="mt-2 text-sm theme-muted">
              Trung tâm điều hành quản trị
            </p>
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
                  Mở
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-[color:var(--border)] p-3 lg:block">
            <div className="relative h-32 overflow-hidden rounded-xl border border-[color:var(--border)]">
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

          <div className="mt-auto hidden border-t border-[color:var(--border)] pt-5 lg:block">
            <ThemeToggle />
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">
          <header className="theme-surface flex flex-col gap-4 rounded-[1.5rem] p-4 sm:rounded-[2rem] sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
                Quản trị doanh nghiệp
              </p>
              <h1 className="mt-2 text-xl font-semibold theme-heading sm:text-2xl">
                Bảng điều khiển vận hành
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
