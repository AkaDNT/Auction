"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, Home, Store, UserRound } from "lucide-react";

const navigation = [
  { label: "Trang chủ", href: "/", icon: Home },
  { label: "Đấu giá", href: "/auctions", icon: Gavel },
  { label: "Hồ sơ", href: "/profile", icon: UserRound },
  { label: "Người bán", href: "/seller", icon: Store },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicSidebar() {
  const pathname = usePathname();

  return (
    <aside className="theme-surface sticky top-10 hidden h-[calc(100vh-10rem)] flex-col rounded-4xl p-6 lg:flex">
      <nav className="mt-6 flex flex-col gap-1.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border-(--border) bg-(--primary-soft) text-foreground"
                  : "border-transparent theme-muted hover:border-(--border) hover:bg-(--primary-soft) hover:text-foreground"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="text-xs uppercase tracking-[0.3em] theme-primary">
                Mở
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
