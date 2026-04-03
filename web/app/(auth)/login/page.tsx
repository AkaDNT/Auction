import Link from "next/link";

import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your auction workspace"
    >
      <form className="space-y-5">
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-medium theme-heading"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-[color:var(--border)] bg-transparent px-4 py-3 text-sm outline-none transition focus:border-[color:var(--primary)]"
          />
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link href="/forgot-password" className="theme-primary">
            Forgot password?
          </Link>
          <Link href="/register" className="theme-muted">
            Create account
          </Link>
        </div>
        <button
          type="submit"
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition"
        >
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}
