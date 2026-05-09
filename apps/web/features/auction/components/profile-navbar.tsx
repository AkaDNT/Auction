"use client";

import Link from "next/link";
import { Menu, Moon, Sun } from "lucide-react";

import { AuthUserMenu } from "@/features/auth/components/auth-user-menu";
import { useAuthUser } from "@/features/auth/services/auth-user.store";
import { useTheme } from "@/shared/components/theme/theme-provider";

type ProfileNavbarProps = {
  onOpenSidebar: () => void;
};

export function ProfileNavbar({ onOpenSidebar }: ProfileNavbarProps) {
  const user = useAuthUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="theme-surface sticky top-0 z-50 border-b border-(--border)">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="rounded-lg p-1.5 text-white transition hover:bg-(--primary-soft) lg:hidden"
            aria-label="Mở menu hồ sơ"
          >
            <Menu size={18} />
          </button>

          <Link href="/profile" className="group flex min-w-0 items-center gap-3">
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
  );
}
