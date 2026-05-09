"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, Home, UserRound, X } from "lucide-react";

const navigation = [
  { label: "Thông tin chung", href: "/profile", icon: Home },
  {
    label: "Chỉnh sửa thông tin cá nhân",
    href: "/profile/edit-profile",
    icon: Gavel,
  },
  { label: "Đổi mật khẩu", href: "/profile/change-password", icon: UserRound },
];

type ProfileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function isNavActive(pathname: string, href: string) {
  if (href === "/profile") {
    return pathname === "/profile";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      ) : null}

      <aside
        className={`theme-surface fixed left-0 top-0 z-50 flex h-screen w-[80vw] flex-col overflow-y-auto rounded-2xl p-4 shadow-2xl transition-transform duration-300 ease-in-out sm:w-75 sm:rounded-3xl sm:p-5 lg:sticky lg:top-10 lg:z-auto lg:mt-10 lg:h-[calc(100vh-10rem)] lg:w-[280px] lg:shrink-0 lg:translate-x-0 lg:overflow-y-auto lg:rounded-4xl lg:p-6 lg:shadow-none lg:transition-none ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-(--primary-soft) lg:hidden"
          aria-label="Đóng menu hồ sơ"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="border-b border-(--border) pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary">
            Hồ sơ
          </p>
          <p className="mt-2 text-sm theme-muted">
            Quản lý tài khoản cá nhân
          </p>
        </div>

        <nav className="mt-5 flex flex-col gap-1.5 lg:mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition lg:rounded-2xl lg:px-4 lg:py-3 ${
                  isActive
                    ? "border-(--border) bg-(--primary-soft) text-foreground"
                    : "border-transparent theme-muted hover:border-(--border) hover:bg-(--primary-soft) hover:text-foreground"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                <span className="hidden text-xs uppercase tracking-[0.3em] theme-primary sm:inline">
                  Mở
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
