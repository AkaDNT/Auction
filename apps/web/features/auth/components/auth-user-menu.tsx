"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

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

type Position = {
  top: number;
  left: number;
};

export function AuthUserMenu() {
  const user = useAuthUser();
  const { theme, toggleTheme } = useTheme();

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

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
      menuItems.push({
        label: "Bảng điều khiển quản trị",
        href: "/admin/dashboard",
      });
    }

    return menuItems;
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updatePosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;

    if (!triggerEl) {
      return;
    }

    const rect = triggerEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = menuEl?.offsetWidth ?? 288; // gần đúng w-72
    const menuHeight = menuEl?.offsetHeight ?? 320;
    const offset = 12;
    const padding = 12;

    let left = rect.right - menuWidth;
    let top = rect.bottom + offset;

    if (left + menuWidth > viewportWidth - padding) {
      left = viewportWidth - menuWidth - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top + menuHeight > viewportHeight - padding) {
      const topAbove = rect.top - menuHeight - offset;
      if (topAbove >= padding) {
        top = topAbove;
      } else {
        top = Math.max(padding, viewportHeight - menuHeight - padding);
      }
    }

    setPosition({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (clickedTrigger || clickedMenu) {
        return;
      }

      closeMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const handleReposition = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, closeMenu, updatePosition]);

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
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
      </div>

      {mounted &&
        createPortal(
          <>
            {isOpen && (
              <button
                type="button"
                aria-label="Đóng menu tài khoản"
                className="fixed inset-0 z-[9998] cursor-default bg-transparent"
                onClick={closeMenu}
              />
            )}

            <div
              ref={menuRef}
              role="menu"
              aria-hidden={!isOpen}
              className={[
                "fixed z-[9999] w-72 overflow-hidden rounded-3xl border border-(--border)",
                "shadow-[0_28px_90px_rgba(15,23,42,0.22)]",
                "transition duration-150 ease-out",
                isOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              ].join(" ")}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
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
                    aria-label={`Chuyển sang chế độ ${
                      theme === "dark" ? "sáng" : "tối"
                    }`}
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
                    onClick={closeMenu}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium theme-muted transition hover:bg-(--primary-soft) hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-(--border) p-2">
                <div onClick={closeMenu}>
                  <LogoutButton />
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
