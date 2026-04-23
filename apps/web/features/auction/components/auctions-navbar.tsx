"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

import { AuthUserMenu } from "@/features/auth/components/auth-user-menu";
import { useAuthUser } from "@/features/auth/services/auth-user.store";
import { useTheme } from "@/shared/components/theme/theme-provider";

export function AuctionsNavbar() {
  const user = useAuthUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-40 bg-theme-panel/85 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      ) : null}

      <header className="theme-surface sticky top-0 z-50 border-b border-(--border)">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
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
              href="/auctions"
              className="group flex min-w-0 items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) text-[11px] font-semibold uppercase tracking-[0.2em] text-(--primary-strong)">
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

          {/* <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/auctions" className="theme-heading">
              Đấu giá
            </Link>
            <span className="theme-muted">/</span> 
          </nav> */}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) transition hover:opacity-90"
              aria-label={`Chuyển sang chế độ ${theme === "dark" ? "sáng" : "tối"}`}
              title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <AuthUserMenu />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--primary-strong) transition hover:bg-(--primary-strong) hover:text-white sm:text-sm"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-(--primary-strong) transition hover:bg-(--primary-strong) hover:text-white sm:text-sm"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside
        className={`theme-surface fixed left-0 top-0 z-50 flex h-screen w-[80vw] flex-col overflow-y-auto rounded-2xl border-r border-(--border) p-4 shadow-2xl transition-transform duration-300 ease-in-out sm:w-72 md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1 theme-muted transition hover:bg-(--primary-soft) hover:text-foreground"
          aria-label="Đóng menu điều hướng"
        >
          <X size={18} />
        </button>

        <div className="border-b border-(--border) pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary">
            AuctionHub
          </p>
          <p className="mt-2 text-sm theme-muted">Điều hướng khu đấu giá</p>
        </div>

        <nav className="mt-4 flex flex-col gap-1.5">
          <Link
            href="/auctions"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl px-3 py-3 text-sm font-medium theme-heading transition hover:bg-(--primary-soft)"
          >
            Đấu giá
          </Link>
        </nav>

        {!user ? (
          <div className="mt-4 space-y-2 border-t border-(--border) pt-4">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-(--primary-strong) transition hover:bg-(--primary-strong) hover:text-white"
            >
              Đăng ký
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-(--primary-strong) transition hover:bg-(--primary-strong) hover:text-white"
            >
              Đăng nhập
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
