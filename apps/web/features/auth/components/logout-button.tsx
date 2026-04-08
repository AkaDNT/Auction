"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutSession } from "@/features/auth/services/auth-session.service";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const onLogout = async () => {
    setIsPending(true);
    await logoutSession();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-full border border-(--border) px-4 py-2 text-sm font-medium theme-muted transition hover:bg-(--primary-soft) hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
