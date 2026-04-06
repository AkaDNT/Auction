import Link from "next/link";

import { navLinks } from "../mocks/home.mock";
import { ThemeToggle } from "@/shared/components/theme/theme-toggle";

export function SiteHeader() {
  return (
    <header className="theme-surface sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 self-start text-[color:var(--foreground)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] text-sm font-bold tracking-[0.3em] text-[color:var(--primary-strong)]">
            AH
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Sàn Đấu Giá
            </p>
            <p className="text-xs theme-muted">
              Nền tảng giao dịch doanh nghiệp
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium theme-muted transition hover:text-[color:var(--primary-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-[auto,1fr] md:flex md:w-auto md:flex-shrink-0 md:items-center md:justify-end md:gap-3">
          <ThemeToggle className="w-full justify-center md:w-auto" />
          <Link
            href="/auctions"
            className="theme-button-primary inline-flex w-full min-w-0 justify-center rounded-full px-4 py-2 text-sm font-semibold transition md:w-auto"
          >
            Bắt đầu đấu giá
          </Link>
        </div>
      </div>
    </header>
  );
}
