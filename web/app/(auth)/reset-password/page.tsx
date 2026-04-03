import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      description="Choose a secure password and return to the marketplace"
    >
      <form className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="newPassword"
          >
            New password
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
            Confirm password
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
          Update password
        </button>
      </form>
    </AuthShell>
  );
}
