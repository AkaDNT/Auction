import { BadgeCheck, UserRound } from "lucide-react";

import type { ProfileUser } from "@/features/profile/types/profile";
import { formatDateTime } from "@/features/profile/utils/profile-format";

type AccountSummarySectionProps = {
  profile: ProfileUser | null;
  isBooting: boolean;
};

export function AccountSummarySection({
  profile,
  isBooting,
}: AccountSummarySectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-theme-line bg-(--primary-soft)">
          <UserRound className="h-6 w-6 theme-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
            Tài khoản
          </p>
          <h2 className="mt-2 truncate font-display text-2xl font-semibold theme-heading">
            {isBooting ? "Đang tải..." : profile?.name}
          </h2>
          <p className="mt-1 truncate text-sm theme-muted">
            {isBooting ? "Đang đồng bộ hồ sơ" : profile?.email}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] theme-muted">Slug</p>
          <p className="mt-2 break-all text-sm font-semibold theme-heading">
            {profile?.slug ?? "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] theme-muted">
            Trạng thái
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-theme-line px-3 py-1 text-xs font-semibold theme-heading">
            <BadgeCheck className="h-4 w-4 theme-primary" aria-hidden />
            {profile?.status ?? "-"}
          </div>
        </div>

        <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] theme-muted">
            Vai trò
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(profile?.roles ?? []).map((role) => (
              <span
                key={role}
                className="rounded-full bg-theme-brand px-3 py-1 text-xs font-semibold text-theme-brand-foreground"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-4">
          <p className="text-xs uppercase tracking-[0.16em] theme-muted">
            Cập nhật gần nhất
          </p>
          <p className="mt-2 text-sm font-semibold theme-heading">
            {profile ? formatDateTime(profile.updatedAt) : "-"}
          </p>
        </div>
      </div>
    </section>
  );
}
