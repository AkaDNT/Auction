import Link from "next/link";

import { AuthShell } from "@/shared/components/layout/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Join the marketplace as a buyer, seller, or operator"
    >
      <form className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium theme-heading"
              htmlFor="firstName"
            >
              First name
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
              Last name
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
            Email
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
            Password
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
          Create account
        </button>
        <p className="text-center text-sm theme-muted">
          Already registered?{" "}
          <Link href="/login" className="theme-primary">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
