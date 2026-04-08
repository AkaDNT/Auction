"use client";

import { FormEvent, useState } from "react";
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

const defaultState: LoginFormState = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  const [form, setForm] = useState<LoginFormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
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
        type="submit"
        disabled={isSubmitting}
        className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
