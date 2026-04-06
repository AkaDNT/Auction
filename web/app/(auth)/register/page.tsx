import Link from "next/link";

import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Tạo tài khoản"
      description="Tham gia sàn với vai trò người mua, người bán hoặc nhân sự vận hành"
    >
      <form className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium theme-heading"
              htmlFor="firstName"
            >
              Tên
            </label>
            <input
              id="firstName"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium theme-heading"
              htmlFor="lastName"
            >
              Họ
            </label>
            <input
              id="lastName"
              className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
            />
          </div>
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="registerEmail"
          >
            Thư điện tử
          </label>
          <input
            id="registerEmail"
            type="email"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="registerPassword"
          >
            Mật khẩu
          </label>
          <input
            id="registerPassword"
            type="password"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <button
          type="submit"
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Tạo tài khoản
        </button>
        <p className="text-center text-sm theme-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="theme-primary">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
