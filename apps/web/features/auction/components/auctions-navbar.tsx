import Link from "next/link";

import { ThemeToggle } from "@/shared/components/theme/theme-toggle";

export function AuctionsNavbar() {
  return (
    <header className="border-b border-theme-line bg-theme-panel/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-theme-brand/40 bg-theme-brand/10 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-brand">
            AH
          </span>
          <span className="font-display text-xl font-semibold text-theme-heading">
            AuctionHub
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-theme-muted md:flex">
          <Link href="/" className="transition-colors hover:text-theme-heading">
            Trang chủ
          </Link>
          <span className="text-theme-line">/</span>
          <Link href="/auctions" className="text-theme-heading">
            Đấu giá
          </Link>
          <span className="text-theme-line">/</span>
          <Link
            href="/auctions/category/xe-dien"
            className="transition-colors hover:text-theme-heading"
          >
            Danh mục
          </Link>
          <span className="text-theme-line">/</span>
          <Link
            href="/login"
            className="transition-colors hover:text-theme-heading"
          >
            Đăng nhập
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/register"
            className="rounded-full border border-theme-brand/60 bg-theme-brand/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-theme-brand transition-colors hover:bg-theme-brand hover:text-theme-brand-foreground sm:text-sm"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}
