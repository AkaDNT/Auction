/**
 * Admin Auctions List Component
 * SOLID: Single Responsibility - displays auction list
 * Dependency: hooks, types, React Query
 */

"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAdminAuctions } from "@/features/admin/hooks";
import type { AdminAuctionListRequest } from "@/features/admin/types";

interface AdminAuctionsListProps {
  request?: AdminAuctionListRequest;
}

function toStatusLabel(status: string): string {
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

function statusBadgeClass(status: string): string {
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

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} VND`;
}

export function AdminAuctionsList({ request = {} }: AdminAuctionsListProps) {
  const auctionsQuery = useAdminAuctions(request);

  const auctions = useMemo(() => {
    return auctionsQuery.data?.data ?? [];
  }, [auctionsQuery.data]);

  if (auctionsQuery.isLoading) {
    return (
      <div className="space-y-2 p-2 sm:space-y-3 sm:p-3 md:p-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-theme-line p-2 sm:rounded-xl sm:p-3"
          >
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-(--primary-soft)" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded-md bg-(--primary-soft)" />
          </div>
        ))}
      </div>
    );
  }

  if (auctionsQuery.isError) {
    return (
      <div className="rounded-xl border border-theme-line px-4 py-3">
        <p className="text-sm text-red-600">
          {auctionsQuery.error instanceof Error
            ? auctionsQuery.error.message
            : "Không thể tải danh sách phiên đấu giá."}
        </p>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="rounded-xl border border-theme-line p-6 text-center text-sm theme-muted">
        Không có phiên đấu giá nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-theme-line">
      <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-[33%]" />
          <col className="w-[18%]" />
          <col className="w-[18%]" />
          <col className="w-[15%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead className="bg-(--primary-soft)">
          <tr className="border-b border-theme-line text-xs font-semibold uppercase tracking-[0.2em] theme-muted">
            <th className="px-3 py-3 text-left">Phiên đấu giá</th>
            <th className="px-3 py-3 text-center">Trạng thái</th>
            <th className="px-3 py-3 text-left">Người bán</th>
            <th className="px-3 py-3 text-right">Giá hiện tại</th>
            <th className="px-3 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map((auction) => (
            <tr
              key={auction.id}
              className="border-b border-theme-line transition hover:bg-(--primary-soft)/45"
            >
              <td className="px-3 py-3 align-middle">
                <p
                  title={auction.title}
                  className="line-clamp-2 text-sm leading-5 font-semibold theme-heading"
                >
                  {auction.title}
                </p>
                <p className="mt-1.5">
                  <span
                    title={auction.id}
                    className="inline-flex max-w-full rounded-md border border-theme-line bg-(--primary-soft) px-2 py-0.5 text-[11px] font-medium theme-muted"
                  >
                    <span className="truncate">ID: {auction.id}</span>
                  </span>
                </p>
              </td>
              <td className="px-3 py-3 text-center align-middle">
                <span
                  className={`inline-flex min-h-7 min-w-27 items-center justify-center whitespace-normal wrap-break-word rounded-full px-2.5 py-1 text-center text-[11px] leading-4 font-semibold uppercase tracking-[0.12em] sm:h-7 sm:whitespace-nowrap sm:leading-none ${statusBadgeClass(
                    auction.status,
                  )}`}
                >
                  {toStatusLabel(auction.status)}
                </span>
              </td>
              <td className="px-3 py-3 text-sm theme-muted align-middle">
                <p className="truncate" title={auction.sellerName}>
                  {auction.sellerName}
                </p>
              </td>
              <td className="px-3 py-3 text-right text-sm font-semibold theme-heading align-middle whitespace-nowrap">
                {formatCurrency(
                  auction.currentHighestBid ?? auction.startingPrice,
                )}
              </td>
              <td className="px-3 py-3 text-right align-middle whitespace-nowrap">
                <Link
                  href={`/admin/auctions/${auction.id}`}
                  className="inline-flex rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft)"
                >
                  Chi tiết
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
