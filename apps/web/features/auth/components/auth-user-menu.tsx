"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { useAuthUser } from "@/features/auth/services/auth-user.store";
import { useTheme } from "@/shared/components/theme/theme-provider";

const baseItems = [{ label: "Chỉnh sửa hồ sơ cá nhân", href: "/profile" }];

function hasRole(roles: string[], expectedRole: string) {
  const normalizedRole = expectedRole.toLowerCase();
  return roles.some((role) => role.toLowerCase() === normalizedRole);
}

function MoonIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

export function AuthUserMenu() {
  const user = useAuthUser();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const items = useMemo(() => {
    if (!user) {
      return [];
    }

    const menuItems = [...baseItems];
    const canAccessBuyerPage =
      hasRole(user.roles, "SELLER") || hasRole(user.roles, "ADMIN");

    if (canAccessBuyerPage) {
      menuItems.push({ label: "Khu vực người mua", href: "/auctions" });
    }

    if (hasRole(user.roles, "SELLER")) {
      menuItems.push({ label: "Khu vực người bán", href: "/seller" });
    }

    if (hasRole(user.roles, "ADMIN")) {
      menuItems.push({ label: "Bảng điều khiển quản trị", href: "/dashboard" });
    }

    return menuItems;
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full border border-(--border) bg-(--primary-soft) px-3 py-2 text-left transition hover:bg-(--primary-soft)"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--primary) text-xs font-semibold text-white">
          {user.name?.charAt(0).toUpperCase() ||
            user.email.charAt(0).toUpperCase()}
        </span>
        <span className="hidden min-w-0 flex-col sm:flex">
          <span className="truncate text-sm font-semibold theme-heading">
            {user.name}
          </span>
          <span className="truncate text-xs theme-muted">{user.email}</span>
        </span>
        <span className="text-xs uppercase tracking-[0.2em] theme-primary">
          Menu
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu tài khoản"
            className="fixed inset-0 z-100 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-[calc(100%+0.75rem)] z-110 w-72 overflow-hidden rounded-3xl border border-(--border) shadow-[0_28px_90px_rgba(15,23,42,0.22)]"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface-strong) 94%, var(--primary-soft) 6%) 0%, color-mix(in srgb, var(--background-alt) 88%, var(--primary-soft) 12%) 100%)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div className="border-b border-(--border) px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold theme-heading">
                    {user.name}
                  </p>
                  <p className="truncate text-xs theme-muted">{user.email}</p>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) transition hover:bg-(--primary-soft)"
                  aria-label={`Chuyển sang chế độ ${theme === "dark" ? "sáng" : "tối"}`}
                  title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
              </div>
            </div>

            <div className="p-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium theme-muted transition hover:bg-(--primary-soft) hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-(--border) p-2">
              <div onClick={() => setIsOpen(false)}>
                <LogoutButton />
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
