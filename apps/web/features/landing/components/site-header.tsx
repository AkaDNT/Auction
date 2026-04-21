"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

import { navLinks } from "../mocks/home.mock";
import { AuthUserMenu } from "@/features/auth/components/auth-user-menu";
import { useAuthUser } from "@/features/auth/services/auth-user.store";
import { useTheme } from "@/shared/components/theme/theme-provider";

export function SiteHeader() {
  const user = useAuthUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-theme-panel/85 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      ) : null}

      <header className="theme-surface sticky top-0 z-50 border-b border-(--border)">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-1.5 text-white transition hover:bg-(--primary-soft) lg:hidden"
                aria-label="Mở menu điều hướng"
              >
                <Menu size={18} />
              </button>

              <Link
                href="/"
                className="flex min-w-0 items-center gap-3 text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-(--border) bg-(--primary-soft) text-sm font-bold tracking-[0.3em] text-(--primary-strong) sm:h-11 sm:w-11">
                  AH
                </span>

                <div className="min-w-0">
                  <p className="text-[13px] leading-[1.35] font-semibold uppercase tracking-[0.1em] theme-primary sm:text-sm sm:tracking-[0.35em]">
                    <span className="sm:whitespace-nowrap">
                      Auction
                      <br className="sm:hidden" />
                      <span className="hidden sm:inline"> </span>
                      Hub
                    </span>
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <nav className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium theme-muted transition hover:text-(--primary-strong)"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) transition hover:opacity-90"
                aria-label={`Chuyển sang chế độ ${theme === "dark" ? "sáng" : "tối"}`}
                title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? <AuthUserMenu /> : null}

              <Link
                href="/auctions"
                className="theme-button-primary inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
              >
                Bắt đầu đấu giá
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) transition hover:opacity-90"
                aria-label={`Chuyển sang chế độ ${theme === "dark" ? "sáng" : "tối"}`}
                title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? <AuthUserMenu /> : null}
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`theme-surface fixed left-0 top-0 z-50 flex h-screen w-[80vw] flex-col overflow-y-auto rounded-2xl p-3 transition-transform duration-300 ease-in-out sm:w-75 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-(--primary-soft)"
          aria-label="Đóng menu điều hướng"
        >
          <X size={18} />
        </button>

        <div className="border-b border-(--border) pb-3 sm:pb-4 md:pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Sàn Đấu Giá
          </p>
          <p className="mt-1 text-xs theme-muted sm:mt-2 sm:text-sm">
            Điều hướng trang chủ
          </p>
        </div>

        <nav className="mt-4 flex flex-col gap-1.5 sm:mt-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2 text-xs font-medium transition hover:border-(--border) hover:bg-(--primary-soft) hover:text-foreground sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm"
            >
              <span>{link.label}</span>
              <span className="hidden text-xs uppercase tracking-[0.3em] theme-primary sm:inline">
                Mở
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-(--border) pt-4">
          <Link
            href="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="theme-button-primary inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
          >
            Bắt đầu đấu giá
          </Link>
        </div>
      </aside>
    </>
  );
}
