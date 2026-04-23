import Image from "next/image";
import Link from "next/link";
import { CountdownText } from "@/features/auction/components/countdown-text";
import type { AuctionSummary } from "@/features/auction/types/auction";

type AuctionListCardProps = {
  auction: AuctionSummary;
  imageQuality: number;
};

export function AuctionListCard({
  auction,
  imageQuality,
}: AuctionListCardProps) {
  return (
    <article className="group rounded-2xl border border-theme-line bg-theme-panel/95 p-4 transition-transform hover:-translate-y-1 hover:shadow-[0_18px_38px_color-mix(in_srgb,var(--primary)_16%,transparent)]">
      <Link
        href={`/auctions/${auction.id}`}
        className="relative mb-3 block h-44 overflow-hidden rounded-xl border border-theme-line"
        aria-label={`Xem chi tiết ${auction.title}`}
      >
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          quality={imageQuality}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <h3
        title={auction.title}
        className="flex min-h-14 items-center text-lg font-semibold leading-7 text-theme-heading"
      >
        <span className="line-clamp-2 block w-full">{auction.title}</span>
      </h3>
      <p className="mt-2 text-sm text-theme-muted">Seller: {auction.seller}</p>

      <div className="mt-4 grid grid-cols-2 auto-rows-fr gap-3 text-sm">
        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
            Giá hiện tại
          </p>
          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
            {auction.currentBid}
          </p>
        </div>
        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
            Giá khởi điểm
          </p>
          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
            {auction.startingPrice}
          </p>
        </div>
        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
            Thời gian
          </p>
          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
            <CountdownText
              timeEnd={auction.timeEnd}
              mode="stacked"
              className="wrap-break-word"
            />
          </p>
        </div>
        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
            Số lượt đặt
          </p>
          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
            {auction.bidCount}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
          {auction.status}
        </span>
      </div>

      <div className="mt-4 flex gap-3">
        <Link
          href={`/auctions/${auction.id}`}
          className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-(--primary-soft) px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading"
        >
          Xem chi tiết
        </Link>
        {auction.status === "Đang diễn ra" || auction.status === "Sắp hết" ? (
          <Link
            href={`/auctions/${auction.id}/live`}
            className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand bg-(--primary) px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-(--primary-foreground) shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-(--primary-strong) hover:shadow-[0_16px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
          >
            Đặt giá ngay
          </Link>
        ) : null}
      </div>
    </article>
  );
}
