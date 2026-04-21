"use client";

import Link from "next/link";

import { useSellerDashboard } from "@/features/auction/hooks/use-seller-dashboard";
import type { AuctionApiStatus } from "@/features/auction/types/auction-api";

const quickActions = [
  {
    label: "Tạo phiên đấu giá",
    href: "/seller/auctions/new",
    description: "Tạo mới một phiên đấu giá",
    variant: "primary",
  },
  {
    label: "Danh sách phiên gần đây",
    href: "/seller/auctions",
    description: "Xem danh sách phiên gần đây của bạn",
    variant: "secondary",
  },
] as const;

function toStatusLabel(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "Đang diễn ra";
  }

  if (status === "DRAFT") {
    return "Nháp";
  }

  if (status === "ENDED") {
    return "Đã kết thúc";
  }

  if (status === "UPCOMING") {
    return "Sắp diễn ra";
  }

  return "Đã hủy";
}

function statusBadgeClass(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "bg-theme-brand text-theme-brand-foreground";
  }

  if (status === "DRAFT") {
    return "border border-theme-line theme-muted";
  }

  if (status === "ENDED") {
    return "border border-theme-line text-theme-body";
  }

  return "border border-theme-line theme-muted";
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không xác định";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function SellerPage() {
  const { overview, recentAuctions, isLoading, isError, error } =
    useSellerDashboard();

  return (
    <div className="space-y-6 pb-6">
      <section className="theme-hero rounded-4xl border border-theme-line p-6 md:p-8">
        <span className="theme-eyebrow">Tổng quan</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight theme-heading sm:text-4xl">
          Bảng điều khiển người bán
        </h1>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Theo dõi nhanh trạng thái các phiên đấu giá của bạn theo thời gian
          thực.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="theme-callout flex h-full flex-col rounded-[1.5rem] p-5">
            <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.32em] theme-primary">
              Tổng phiên đấu giá
            </p>
            <p className="mt-auto pt-3 text-4xl font-semibold theme-heading">
              {isLoading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-(--primary-soft)" />
              ) : (
                overview.total
              )}
            </p>
          </article>
          <article className="theme-callout flex h-full flex-col rounded-[1.5rem] p-5">
            <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.32em] theme-primary">
              Phiên đang diễn ra
            </p>
            <p className="mt-auto pt-3 text-4xl font-semibold theme-heading">
              {isLoading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-(--primary-soft)" />
              ) : (
                overview.live
              )}
            </p>
          </article>
          <article className="theme-callout flex h-full flex-col rounded-[1.5rem] p-5">
            <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.32em] theme-primary">
              Phiên nháp
            </p>
            <p className="mt-auto pt-3 text-4xl font-semibold theme-heading">
              {isLoading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-(--primary-soft)" />
              ) : (
                overview.draft
              )}
            </p>
          </article>
          <article className="theme-callout flex h-full flex-col rounded-[1.5rem] p-5">
            <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.32em] theme-primary">
              Phiên đã kết thúc
            </p>
            <p className="mt-auto pt-3 text-4xl font-semibold theme-heading">
              {isLoading ? (
                <span className="inline-block h-10 w-20 animate-pulse rounded-xl bg-(--primary-soft)" />
              ) : (
                overview.ended
              )}
            </p>
          </article>
        </div>

        {isError ? (
          <p className="mt-4 rounded-2xl border border-theme-line bg-theme-card px-4 py-3 text-sm text-red-600">
            {error?.message ?? "Không thể tải dữ liệu dashboard."}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="theme-card rounded-[1.75rem] p-6 md:p-7">
          <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.35em] theme-primary">
            Tác vụ nhanh
          </p>

          <div className="mt-6 space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={
                  action.variant === "primary"
                    ? "group block rounded-2xl border border-transparent theme-button-primary px-5 py-4 transition"
                    : "group block rounded-2xl theme-button-secondary px-5 py-4 transition"
                }
              >
                <p className="text-base font-semibold">{action.label}</p>
                <p className="mt-1 text-sm opacity-85">{action.description}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="theme-surface rounded-[1.75rem] p-6 md:p-7">
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <div>
              <p className="flex min-h-12 items-center text-sm uppercase tracking-[0.35em] theme-primary">
                Danh sách phiên gần đây
              </p>
            </div>
            <Link
              href="/seller/auctions"
              className="inline-flex h-10 min-w-[108px] items-center justify-center self-start rounded-xl px-3 py-2 text-sm theme-button-secondary sm:self-auto"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {isLoading
              ? [1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-theme-line p-4"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="h-5 w-4/5 animate-pulse rounded-md bg-(--primary-soft)" />
                      <div className="h-8 w-[118px] animate-pulse rounded-full bg-(--primary-soft)" />
                    </div>
                    <div className="mt-3 h-4 w-1/2 animate-pulse rounded-md bg-(--primary-soft)" />
                  </div>
                ))
              : null}

            {!isLoading && recentAuctions.length === 0 ? (
              <div className="rounded-2xl border border-theme-line p-4">
                <p className="text-sm theme-muted">
                  Chưa có phiên đấu giá nào.
                </p>
                <Link
                  href="/seller/auctions/new"
                  className="theme-button-primary mt-3 inline-flex rounded-full px-4 py-2 text-sm font-semibold transition"
                >
                  Tạo phiên đấu giá đầu tiên
                </Link>
              </div>
            ) : null}

            {recentAuctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/seller/auctions/${auction.id}`}
                className="block rounded-2xl border border-theme-line p-4 transition hover:border-(--border) hover:bg-(--primary-soft)"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <p className="min-w-0 font-semibold theme-heading">
                    {auction.title}
                  </p>
                  <span
                    className={`inline-flex h-8 min-w-[118px] items-center justify-center rounded-full px-3 py-1 text-center text-xs font-semibold tracking-[0.22em] uppercase ${statusBadgeClass(
                      auction.status,
                    )}`}
                  >
                    {toStatusLabel(auction.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm theme-muted">
                  Kết thúc: {formatDateTime(auction.endAt)}
                </p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
