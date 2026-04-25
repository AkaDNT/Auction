/**
 * Admin Auction Detail Page
 * Route: /admin/auctions/[id]
 * SOLID: Single Responsibility - displays auction detail management
 */

"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { AdminAuctionDetail } from "@/features/admin/components";
import {
  useAdminAuctionById,
  useCancelAdminAuction,
} from "@/features/admin/hooks";

export default function AdminAuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const cancelMutation = useCancelAdminAuction();

  const auctionId = useMemo(() => {
    if (!params?.id) {
      return "";
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params?.id]);

  const auctionQuery = useAdminAuctionById(auctionId);

  const handleCancelAuction = async () => {
    if (!auctionId || cancelMutation.isPending) {
      return;
    }

    const shouldCancel = window.confirm(
      "Bạn có chắc muốn hủy phiên đấu giá này không?",
    );

    if (!shouldCancel) {
      return;
    }

    try {
      await cancelMutation.mutateAsync({ auctionId });
      await auctionQuery.refetch();
      window.alert("Đã hủy phiên đấu giá thành công.");
    } catch {
      window.alert("Không thể hủy phiên đấu giá. Vui lòng thử lại.");
    }
  };

  const statusLabel =
    auctionQuery.data?.status === "LIVE"
      ? "Đang diễn ra"
      : auctionQuery.data?.status === "DRAFT"
        ? "Nháp"
        : auctionQuery.data?.status === "UPCOMING"
          ? "Sắp diễn ra"
          : auctionQuery.data?.status === "ENDED"
            ? "Đã kết thúc"
            : auctionQuery.data?.status === "CANCELLED"
              ? "Đã hủy"
              : "Đang tải";

  return (
    <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
      <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/30 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
                Phiên đấu giá quản trị
              </p>
            </div>

            <h1 className="mt-2 text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
              Chi tiết phiên đấu giá
            </h1>
            <p className="mt-1 text-xs theme-muted sm:text-sm">
              Theo dõi thông tin phiên và thực hiện thao tác quản trị khi cần.
            </p>

            {auctionQuery.data?.code ? (
              <p className="mt-3 inline-flex rounded-lg border border-theme-line bg-(--primary-soft) px-2.5 py-1 text-xs font-medium theme-muted">
                Mã phiên: {auctionQuery.data.code}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/auctions"
              className="theme-button-secondary inline-flex w-fit rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <AdminAuctionDetail
          auctionId={auctionId}
          onCancelAuction={handleCancelAuction}
          cancelPending={cancelMutation.isPending}
        />
      </div>
    </section>
  );
}
