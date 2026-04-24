import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";
import {
  formatCurrency,
  formatDateTime,
  isHttpUrl,
  statusBadgeClass,
  statusLabel,
} from "@/features/auction/utils/seller-auction-detail-utils";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";

type SellerAuctionDetailOverviewProps = {
  auction: AuctionApiItem;
};

export function SellerAuctionDetailOverview({
  auction,
}: SellerAuctionDetailOverviewProps) {
  const thumbnailUrl = auction.thumbnailUrl?.trim() ?? "";
  const canPreviewThumbnail = isHttpUrl(thumbnailUrl);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Chi tiết phiên đấu giá
          </p>
          <h1 className="mt-2 wrap-break-word text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
            {auction.title}
          </h1>
          <p className="mt-1 text-xs theme-muted sm:text-sm">
            Mã phiên:{" "}
            <span className="font-semibold theme-heading">{auction.code}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-8 min-w-30 items-center justify-center rounded-full px-3 py-1 text-center text-xs font-semibold tracking-[0.22em] uppercase ${statusBadgeClass(
              auction.status,
            )}`}
          >
            {statusLabel(auction.status)}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Danh mục
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {getVietnameseCategoryLabel(
              auction.category.slug,
              auction.category.label,
            )}
          </p>
        </article>

        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Giá khởi điểm
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {formatCurrency(auction.startingPrice)}
          </p>
        </article>

        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Giá mua ngay
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {formatCurrency(auction.buyNowPrice)}
          </p>
        </article>

        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Bước giá tối thiểu
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {formatCurrency(auction.minBidIncrement)}
          </p>
        </article>

        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Thời gian kết thúc
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {formatDateTime(auction.endAt)}
          </p>
        </article>

        <article className="rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Tổng lượt đặt giá
          </p>
          <p className="mt-2 font-semibold theme-heading">
            {auction._count.bids}
          </p>
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-theme-line p-4">
        <p className="text-xs uppercase tracking-[0.18em] theme-muted">Mô tả</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 theme-body">
          {auction.description?.trim() ||
            "Chưa có mô tả cho phiên đấu giá này."}
        </p>
      </article>

      {canPreviewThumbnail ? (
        <article className="mt-4 overflow-hidden rounded-2xl border border-theme-line bg-(--primary-soft)">
          <img
            src={thumbnailUrl}
            alt={`Ảnh đại diện ${auction.title}`}
            className="h-52 w-full object-cover sm:h-64"
          />
        </article>
      ) : null}
    </>
  );
}
