"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthApiError } from "@/features/auth/services/auth-api.error";
import { getRoleLandingPath } from "@/features/auth/services/auth-routing";
import { LocalAuthSessionStorage } from "@/features/auth/services/auth-session.storage";
import { setAuthUser } from "@/features/auth/services/auth-user.store";
import { setAuthAccessToken } from "@/features/auth/services/auth-token.store";
import { registerUser } from "@/features/auth/services/register-user";

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultState: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const router = useRouter();
  const storage = new LocalAuthSessionStorage();
  const [form, setForm] = useState<RegisterFormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      setSuccessMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      const result = await registerUser(payload);
      setAuthAccessToken(result.accessToken);
      setAuthUser(result.user);
      storage.saveRegisterSnapshot(payload);

      setSuccessMessage(
        "Tạo tài khoản thành công. Đang chuyển đến khu vực phù hợp...",
      );
      setForm(defaultState);
      router.replace(getRoleLandingPath(result.user.roles));
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
          htmlFor="firstName"
        >
          Tên hiển thị
        </label>
        <input
          id="firstName"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          required
          minLength={2}
          maxLength={50}
          className="w-full rounded-2xl border border-(--border) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--primary)"
        />
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
          htmlFor="registerPassword"
        >
          Mật khẩu
        </label>
        <input
          id="registerPassword"
          type="password"
          autoComplete="off"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          required
          minLength={8}
          className="w-full rounded-2xl border border-(--border) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--primary)"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium theme-heading"
          htmlFor="registerConfirmPassword"
        >
          Xác nhận mật khẩu
        </label>
        <input
          id="registerConfirmPassword"
          type="password"
          autoComplete="off"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              confirmPassword: event.target.value,
            }))
          }
          required
          minLength={8}
          className="w-full rounded-2xl border border-(--border) bg-transparent px-4 py-3 text-sm outline-none transition focus:border-(--primary)"
        />
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="theme-button-primary inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </button>

      <p className="text-center text-sm theme-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="theme-primary">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
