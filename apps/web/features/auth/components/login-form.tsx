"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { loginUser } from "@/features/auth/services/login-user";
import { resolvePostAuthPath } from "@/features/auth/services/auth-routing";
import { setAuthUser } from "@/features/auth/services/auth-user.store";
import { setAuthAccessToken } from "@/features/auth/services/auth-token.store";
import { safeNextPath } from "@/features/auth/services/safe-next-path";

type LoginFormState = {
  email: string;
  password: string;
};

type TestAccount = {
  label: string;
  email: string;
  roles: string;
};

const defaultState: LoginFormState = {
  email: "",
  password: "",
};

const testAccounts: TestAccount[] = [
  {
    label: "User",
    email: "user@gmail.com",
    roles: "USER",
  },
  {
    label: "Seller",
    email: "seller@gmail.com",
    roles: "SELLER, USER",
  },
  {
    label: "Admin",
    email: "admin@gmail.com",
    roles: "ADMIN, SELLER, USER",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [form, setForm] = useState<LoginFormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTestAccountsOpen, setIsTestAccountsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isTestAccountsOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTestAccountsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTestAccountsOpen]);

  useEffect(() => {
    if (!copiedKey) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedKey(null);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedKey]);

  const copyToClipboard = async (value: string, key: string) => {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      setAuthAccessToken(result.accessToken);
      setAuthUser(result.user);
      router.replace(resolvePostAuthPath(result.user.roles, nextPath));
    } catch (error) {
      if (error instanceof AuthApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đã có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
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
            autoComplete="off"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
            className="w-full rounded-2xl border border-(--border) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--primary)"
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
            autoComplete="off"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
            minLength={6}
            className="w-full rounded-2xl border border-(--border) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--primary)"
          />
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 text-sm">
          <Link href="/forgot-password" className="theme-primary">
            Quên mật khẩu?
          </Link>
          <Link href="/register" className="theme-muted">
            Tạo tài khoản
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsTestAccountsOpen(true)}
          className="inline-flex w-full items-center justify-center rounded-full border border-(--border) bg-(--primary-soft) px-5 py-3 text-sm font-semibold theme-heading transition hover:border-(--primary) hover:text-(--primary-strong)"
        >
          Xem tài khoản test
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {isTestAccountsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="test-accounts-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm dark:bg-black/75"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsTestAccountsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20 sm:p-6 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:shadow-black/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="test-accounts-title"
                  className="text-lg font-semibold text-slate-950 dark:text-slate-50"
                >
                  Tài khoản test
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Tất cả tài khoản bên dưới dùng chung mật khẩu{" "}
                  <span className="font-semibold text-slate-950 dark:text-white">
                    Test1234@
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTestAccountsOpen(false)}
                className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {testAccounts.map((account) => (
                <div
                  key={account.email}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                      {account.label}
                    </h4>

                    <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-300">
                      {account.roles}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                      <div>
                        <span className="block text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Email
                        </span>
                        <span className="mt-1 block font-medium text-slate-950 dark:text-slate-50">
                          {account.email}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            account.email,
                            `${account.email}:email`,
                          )
                        }
                        className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 dark:border-blue-700/60 dark:bg-blue-950/60 dark:text-blue-200 dark:hover:border-blue-400 dark:hover:bg-blue-900"
                      >
                        {copiedKey === `${account.email}:email`
                          ? "Đã sao chép"
                          : "Copy"}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                      <div>
                        <span className="block text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                          Mật khẩu
                        </span>
                        <span className="mt-1 block font-medium text-slate-950 dark:text-slate-50">
                          Test1234@
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            "Test1234@",
                            `${account.email}:password`,
                          )
                        }
                        className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100 dark:border-blue-700/60 dark:bg-blue-950/60 dark:text-blue-200 dark:hover:border-blue-400 dark:hover:bg-blue-900"
                      >
                        {copiedKey === `${account.email}:password`
                          ? "Đã sao chép"
                          : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
