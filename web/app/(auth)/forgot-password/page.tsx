import Link from "next/link";

import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Khôi phục mật khẩu"
      description="Đặt lại quyền truy cập mà không làm gián đoạn công việc"
    >
      <form className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="recoverEmail"
          >
            Thư điện tử
          </label>
          <input
            id="recoverEmail"
            type="email"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <button
          type="submit"
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Gửi liên kết khôi phục
        </button>
        <p className="text-center text-sm theme-muted">
          Nhớ ra rồi?{" "}
          <Link href="/login" className="theme-primary">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
