import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Đặt mật khẩu mới"
      description="Chọn một mật khẩu an toàn và quay lại sàn đấu giá"
    >
      <form className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="newPassword"
          >
            Mật khẩu mới
          </label>
          <input
            id="newPassword"
            type="password"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="confirmPassword"
          >
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <button
          type="submit"
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Cập nhật mật khẩu
        </button>
      </form>
    </AuthShell>
  );
}
