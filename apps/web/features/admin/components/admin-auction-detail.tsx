/**
 * Admin Auction Detail Component
 * SOLID: Single Responsibility - displays auction details
 * Dependency: hooks, types
 */

"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useAdminAuctionById } from "@/features/admin/hooks";

interface AdminAuctionDetailProps {
  auctionId: string;
  onCancelAuction?: () => Promise<void> | void;
  cancelPending?: boolean;
}

export function AdminAuctionDetail({
  auctionId,
  onCancelAuction,
  cancelPending = false,
}: AdminAuctionDetailProps) {
  const auctionQuery = useAdminAuctionById(auctionId);

  const auction = useMemo(() => {
    return auctionQuery.data;
  }, [auctionQuery.data]);

  const toStatusLabel = (status: string) => {
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
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return "0 VND";
    }

    return `${new Intl.NumberFormat("vi-VN", {
      maximumFractionDigits: 0,
    }).format(value)} VND`;
  };

  const formatDateTime = (value: string) => {
    if (!value) {
      return "Chưa cập nhật";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Chưa cập nhật";
    }

    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const statusBadgeClass = (status: string) => {
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
  };

  if (auctionQuery.isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-2 sm:p-3">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 rounded-2xl border border-theme-line bg-(--primary-soft)"
            />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-80 rounded-2xl border border-theme-line bg-(--primary-soft)" />
          <div className="h-80 rounded-2xl border border-theme-line bg-(--primary-soft)" />
        </div>
      </div>
    );
  }

  if (auctionQuery.isError || !auction) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
        {auctionQuery.error instanceof Error
          ? auctionQuery.error.message
          : "Không thể tải chi tiết phiên đấu giá."}
      </div>
    );
  }

  const canCancel = auction.status === "LIVE";

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="theme-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">
            Trạng thái
          </p>
          <div className="mt-3">
            <span
              className={`inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusBadgeClass(
                auction.status,
              )}`}
            >
              {toStatusLabel(auction.status)}
            </span>
          </div>
        </article>

        <article className="theme-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">
            Giá hiện tại
          </p>
          <p className="mt-3 text-xl font-semibold theme-heading sm:text-2xl">
            {formatCurrency(auction.currentPrice ?? auction.currentHighestBid)}
          </p>
        </article>

        <article className="theme-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">
            Lượt đặt giá
          </p>
          <p className="mt-3 text-xl font-semibold theme-heading sm:text-2xl">
            {auction.currentBidCount}
          </p>
        </article>

        <article className="theme-card rounded-2xl p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.2em] theme-muted">
            Kết thúc phiên
          </p>
          <p className="mt-3 text-sm font-semibold theme-heading sm:text-base">
            {formatDateTime(auction.endAt)}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="theme-card rounded-2xl p-4 sm:p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] theme-primary">
                Phiên đấu giá
              </p>
              <h2 className="mt-2 text-xl font-semibold theme-heading sm:text-2xl">
                {auction.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg border border-theme-line bg-(--primary-soft) px-2.5 py-1 text-xs font-medium theme-muted">
                Code: {auction.code}
              </span>
              <span className="rounded-lg border border-theme-line bg-(--primary-soft) px-2.5 py-1 text-xs font-medium theme-muted">
                Slug: {auction.slug}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.14em] theme-muted">
              Mô tả chi tiết
            </p>
            <p className="mt-2 text-sm leading-relaxed theme-body sm:text-base">
              {auction.description || "Chưa có mô tả cho phiên đấu giá này."}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-theme-line p-3">
              <p className="text-xs uppercase tracking-[0.14em] theme-muted">
                Giá khởi điểm
              </p>
              <p className="mt-2 text-sm font-semibold theme-heading sm:text-base">
                {formatCurrency(auction.startingPrice)}
              </p>
            </div>
            <div className="rounded-xl border border-theme-line p-3">
              <p className="text-xs uppercase tracking-[0.14em] theme-muted">
                Mua ngay
              </p>
              <p className="mt-2 text-sm font-semibold theme-heading sm:text-base">
                {formatCurrency(auction.buyNowPrice)}
              </p>
            </div>
            <div className="rounded-xl border border-theme-line p-3">
              <p className="text-xs uppercase tracking-[0.14em] theme-muted">
                Bước giá tối thiểu
              </p>
              <p className="mt-2 text-sm font-semibold theme-heading sm:text-base">
                {formatCurrency(auction.minBidIncrement)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-theme-line p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.14em] theme-muted">
              Metadata
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="text-xs theme-muted">Auction ID: {auction.id}</p>
              <p className="text-xs theme-muted">Số ảnh: {auction.imageCount}</p>
              <p className="text-xs theme-muted">
                Bắt đầu: {formatDateTime(auction.startAt)}
              </p>
              <p className="text-xs theme-muted">
                Tạo lúc: {formatDateTime(auction.createdAt)}
              </p>
              <p className="text-xs theme-muted sm:col-span-2">
                Cập nhật: {formatDateTime(auction.updatedAt)}
              </p>
            </div>
          </div>
        </article>

        <article className="theme-card rounded-2xl p-4 sm:p-5 lg:p-6">
          <p className="text-xs uppercase tracking-[0.2em] theme-primary">
            Hồ sơ vận hành
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-theme-line">
            {auction.thumbnailUrl ? (
              <div className="relative aspect-16/10 w-full">
                <Image
                  src={auction.thumbnailUrl}
                  alt={auction.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 35vw"
                />
              </div>
            ) : (
              <div className="flex aspect-16/10 w-full items-center justify-center bg-(--primary-soft) px-4 text-center text-sm theme-muted">
                Chưa có ảnh đại diện cho phiên đấu giá
              </div>
            )}
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-theme-line p-3">
              <dt className="text-xs uppercase tracking-[0.14em] theme-muted">
                Người bán
              </dt>
              <dd className="mt-1 font-semibold theme-heading">
                {auction.sellerName}
              </dd>
              <dd className="mt-1 text-xs theme-muted">
                {auction.sellerEmail}
              </dd>
            </div>

            <div className="rounded-xl border border-theme-line p-3">
              <dt className="text-xs uppercase tracking-[0.14em] theme-muted">
                Danh mục
              </dt>
              <dd className="mt-1 font-semibold theme-heading">
                {auction.categoryName}
              </dd>
              <dd className="mt-1 text-xs theme-muted">
                Category ID: {auction.categoryId}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!onCancelAuction || cancelPending || !canCancel) {
                  return;
                }
                void onCancelAuction();
              }}
              disabled={!onCancelAuction || !canCancel || cancelPending}
              className="inline-flex w-fit cursor-pointer rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              {cancelPending ? "Đang hủy..." : "Hủy phiên"}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
