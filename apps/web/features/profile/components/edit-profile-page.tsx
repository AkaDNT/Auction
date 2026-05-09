"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AtSign, Loader2, Save, UserRound } from "lucide-react";

import { setAuthUser } from "@/features/auth/services/auth-user.store";
import { AccountSummarySection } from "@/features/profile/components/account-summary-section";
import { FieldLabel } from "@/features/profile/components/field-label";
import { ProfilePageFrame } from "@/features/profile/components/profile-page-frame";
import { StatusMessage } from "@/features/profile/components/status-message";
import { useProfileData } from "@/features/profile/hooks/use-profile-data";
import {
  updateEmail,
  updateMyProfile,
} from "@/features/profile/services/profile-api";
import { toUserStorePayload } from "@/features/profile/services/profile-user-store";
import type {
  EmailFormState,
  ProfileFormState,
} from "@/features/profile/types/profile";
import { getErrorMessage } from "@/features/profile/utils/profile-error";

const emptyProfileForm: ProfileFormState = {
  name: "",
  slug: "",
};

const emptyEmailForm: EmailFormState = {
  email: "",
  password: "",
};

export function EditProfilePage() {
  const { profile, profileQuery, queryClient, isBooting } = useProfileData();
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(emptyProfileForm);
  const [emailForm, setEmailForm] = useState<EmailFormState>(emptyEmailForm);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      name: profile.name,
      slug: profile.slug,
    });
    setEmailForm((current) => ({
      ...current,
      email: profile.email,
    }));
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(["profile", "me"], user);
      setAuthUser(toUserStorePayload(user));
      setProfileMessage("Hồ sơ đã được cập nhật.");
    },
  });

  const emailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: (user) => {
      queryClient.setQueryData(["profile", "me"], user);
      setAuthUser(toUserStorePayload(user));
      setEmailForm({ email: user.email, password: "" });
      setEmailMessage("Email đã được cập nhật.");
    },
  });

  const profileError = useMemo(
    () =>
      profileMutation.error
        ? getErrorMessage(profileMutation.error, "Không thể cập nhật hồ sơ.")
        : null,
    [profileMutation.error],
  );

  const emailError = useMemo(
    () =>
      emailMutation.error
        ? getErrorMessage(emailMutation.error, "Không thể cập nhật email.")
        : null,
    [emailMutation.error],
  );

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMessage(null);
    profileMutation.mutate({
      name: profileForm.name.trim(),
      slug: profileForm.slug.trim(),
    });
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailMessage(null);
    emailMutation.mutate({
      email: emailForm.email.trim(),
      password: emailForm.password,
    });
  };

  return (
    <ProfilePageFrame
      title="Chỉnh sửa thông tin cá nhân"
      description="Cập nhật tên hiển thị, slug công khai và email đăng nhập của bạn."
      profileQuery={profileQuery}
    >
      <AccountSummarySection profile={profile} isBooting={isBooting} />

      <form
        className="space-y-6 border-t border-theme-line pt-6"
        onSubmit={handleProfileSubmit}
      >
        <div className="flex items-start gap-3">
          <UserRound className="mt-0.5 h-5 w-5 theme-primary" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold theme-heading">
              Thông tin hiển thị
            </h2>
            <p className="mt-1 text-sm leading-6 theme-muted">
              Tên và slug sẽ xuất hiện trong các khu vực công khai.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="profile-name">Tên hiển thị</FieldLabel>
            <input
              id="profile-name"
              type="text"
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              minLength={2}
              maxLength={50}
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
            />
          </div>

          <div>
            <FieldLabel htmlFor="profile-slug">Slug</FieldLabel>
            <input
              id="profile-slug"
              type="text"
              value={profileForm.slug}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
              minLength={3}
              maxLength={60}
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusMessage kind="success" message={profileMessage} />
          <StatusMessage kind="error" message={profileError} />
        </div>

        <button
          type="submit"
          disabled={profileMutation.isPending}
          className="theme-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {profileMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Lưu hồ sơ
        </button>
      </form>

      <form
        className="space-y-6 border-t border-theme-line pt-6"
        onSubmit={handleEmailSubmit}
      >
        <div className="flex items-start gap-3">
          <AtSign className="mt-0.5 h-5 w-5 theme-primary" aria-hidden />
          <div>
            <h2 className="text-lg font-semibold theme-heading">
              Email đăng nhập
            </h2>
            <p className="mt-1 text-sm leading-6 theme-muted">
              Cần nhập mật khẩu hiện tại để xác nhận thay đổi email.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="profile-email">Email mới</FieldLabel>
            <input
              id="profile-email"
              type="email"
              value={emailForm.email}
              onChange={(event) =>
                setEmailForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
            />
          </div>

          <div>
            <FieldLabel htmlFor="profile-email-password">
              Mật khẩu hiện tại
            </FieldLabel>
            <input
              id="profile-email-password"
              type="password"
              value={emailForm.password}
              onChange={(event) =>
                setEmailForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              minLength={6}
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--primary)"
            />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusMessage kind="success" message={emailMessage} />
          <StatusMessage kind="error" message={emailError} />
        </div>

        <button
          type="submit"
          disabled={emailMutation.isPending}
          className="theme-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {emailMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Cập nhật email
        </button>
      </form>
    </ProfilePageFrame>
  );
}
