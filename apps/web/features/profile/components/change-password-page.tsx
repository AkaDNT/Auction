"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Loader2 } from "lucide-react";

import { clearAuthAccessToken } from "@/features/auth/services/auth-token.store";
import { clearAuthUser } from "@/features/auth/services/auth-user.store";
import { FieldLabel } from "@/features/profile/components/field-label";
import { ProfilePageFrame } from "@/features/profile/components/profile-page-frame";
import { StatusMessage } from "@/features/profile/components/status-message";
import { useProfileData } from "@/features/profile/hooks/use-profile-data";
import { changePassword } from "@/features/profile/services/profile-api";
import type { PasswordFormState } from "@/features/profile/types/profile";
import { getErrorMessage } from "@/features/profile/utils/profile-error";

const emptyPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordPage() {
  const { profileQuery, router } = useProfileData();
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormState>(emptyPasswordForm);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Mật khẩu đã được đổi. Vui lòng đăng nhập lại.");
      clearAuthAccessToken();
      clearAuthUser();
      window.setTimeout(() => {
        router.replace("/login?next=/profile");
      }, 900);
    },
  });

  const passwordError = useMemo(
    () =>
      passwordMutation.error
        ? getErrorMessage(passwordMutation.error, "Không thể đổi mật khẩu.")
        : null,
    [passwordMutation.error],
  );

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage(null);
    passwordMutation.mutate(passwordForm);
  };

  return (
    <ProfilePageFrame
      title="Đổi mật khẩu"
      description="Cập nhật mật khẩu đăng nhập và xác thực lại phiên làm việc của bạn."
      profileQuery={profileQuery}
    >
      <form className="space-y-6" onSubmit={handlePasswordSubmit}>
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-5 w-5 theme-primary" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold theme-heading">
              Đổi mật khẩu
            </h2>
            <p className="mt-1 text-sm leading-6 theme-muted">
              Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <FieldLabel htmlFor="current-password">Mật khẩu hiện tại</FieldLabel>
            <input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
              <input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
              />
            </div>

            <div>
              <FieldLabel htmlFor="confirm-password">
                Xác nhận mật khẩu
              </FieldLabel>
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusMessage kind="success" message={passwordMessage} />
          <StatusMessage kind="error" message={passwordError} />
        </div>

        <button
          type="submit"
          disabled={passwordMutation.isPending}
          className="theme-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {passwordMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <KeyRound className="h-4 w-4" aria-hidden />
          )}
          Đổi mật khẩu
        </button>
      </form>
    </ProfilePageFrame>
  );
}
