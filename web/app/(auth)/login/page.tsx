import Link from "next/link";

import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Chào mừng trở lại"
      description="Đăng nhập vào không gian làm việc của sàn đấu giá"
    >
      <form className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="email"
          >
            Thư điện tử
          </label>
          <input
            id="email"
            type="email"
            placeholder="ten@congty.com"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link href="/forgot-password" className="theme-primary">
            Quên mật khẩu?
          </Link>
          <Link href="/register" className="theme-muted">
            Tạo tài khoản
          </Link>
        </div>
        <button
          type="submit"
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Đăng nhập
        </button>
      </form>
    </AuthShell>
  );
}
