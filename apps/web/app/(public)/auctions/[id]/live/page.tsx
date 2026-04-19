import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { CountdownText } from "@/features/auction/components/countdown-text";
import {
  LiveBidCountText,
  LiveCurrentPriceText,
} from "@/features/auction/components/live-auction-realtime-metric";
import { LiveBidHistory } from "@/features/auction/components/live-bid-history";
import { mapAuctionApiItemToSummary } from "@/features/auction/services/auction.mapper";
import { getAuctionById } from "@/features/auction/services/list-auctions";
import { SiteFooter } from "@/features/landing/components/site-footer";

type LiveRoomPageProps = {
  params: Promise<{ id: string }>;
};

function toCurrencyLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "Chưa thiết lập";
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "Chưa thiết lập";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

function getLiveStatusLabel(status: string) {
  if (status === "LIVE") return "Đang diễn ra";
  if (status === "UPCOMING") return "Sắp diễn ra";
  if (status === "ENDED") return "Đã kết thúc";
  if (status === "CANCELLED") return "Đã hủy";
  return "Nháp";
}

export default async function LiveRoomPage({ params }: LiveRoomPageProps) {
  const { id } = await params;
  const auctionItem = await getAuctionById(id);

  if (!auctionItem) {
    notFound();
  }

  const auction = mapAuctionApiItemToSummary(auctionItem);
  const basePrice = Number(
    auctionItem.currentPrice ?? auctionItem.startingPrice,
  );
  const minIncrement = Number(auctionItem.minBidIncrement);
  const normalizedMinIncrement =
    Number.isFinite(minIncrement) && minIncrement > 0 ? minIncrement : 1000;
  const suggestedBidAmount =
    (Number.isFinite(basePrice) ? basePrice : 0) + normalizedMinIncrement;
  const hasLiveCountdown = auctionItem.status === "LIVE";
  const statusLabel = getLiveStatusLabel(auctionItem.status);
  const initialCurrentPriceAmount = Number(
    auctionItem.currentPrice ?? auctionItem.startingPrice,
  );
  const startingPriceLabel = toCurrencyLabel(auctionItem.startingPrice);
  const minBidIncrementLabel = toCurrencyLabel(auctionItem.minBidIncrement);
  const buyNowPriceLabel = toCurrencyLabel(auctionItem.buyNowPrice);

  return (
    <main className="min-h-screen text-theme-body">
      <AuctionsNavbar />

      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
              Live Room
            </p>
            <h1 className="font-display text-3xl font-semibold text-theme-heading sm:text-4xl">
              {auction.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 font-semibold text-theme-muted">
                Mã lô: {auctionItem.code}
              </span>
              <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 font-semibold text-theme-muted">
                {auction.category}
              </span>
              <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 font-semibold text-theme-muted">
                <LiveBidCountText
                  auctionId={auction.id}
                  initialCount={auction.bidCount}
                />{" "}
                lượt đấu giá
              </span>
            </div>
          </div>
          <Link href={`/auctions/${auction.id}`} className="btn-secondary">
            Xem chi tiết lô
          </Link>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.3fr_1fr]">
          <article className="relative justify-center flex h-full flex-col overflow-hidden rounded-3xl border border-theme-line bg-theme-panel p-6 shadow-[0_22px_60px_-34px_var(--glow)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_58%)]" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
                  Live Monitoring
                </p>
                <h2 className="mt-1 text-xl font-semibold text-theme-heading">
                  Trạng thái phiên trực tiếp
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-theme-line bg-theme-bg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-brand">
                <span
                  className={`h-2 w-2 rounded-full ${
                    hasLiveCountdown ? "bg-theme-brand" : "bg-theme-muted"
                  }`}
                />
                {statusLabel}
              </span>
            </div>

            <div className="relative z-10 mt-6 mb-4 h-52 overflow-hidden rounded-2xl border border-theme-line sm:h-64">
              <Image
                src={auction.imageUrl}
                alt={`Phòng đấu giá ${auction.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {auction.title}
              </p>
            </div>

            <div className="relative z-10 mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Giá hiện tại
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  <LiveCurrentPriceText
                    auctionId={auction.id}
                    initialAmount={
                      Number.isFinite(initialCurrentPriceAmount)
                        ? initialCurrentPriceAmount
                        : 0
                    }
                  />
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  {hasLiveCountdown ? "Đếm ngược" : "Trạng thái"}
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  {hasLiveCountdown ? (
                    <CountdownText timeEnd={auction.timeEnd} />
                  ) : (
                    statusLabel
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Người bán
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  {auction.seller}
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Giá khởi điểm
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  {startingPriceLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Bước giá tối thiểu
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  {minBidIncrementLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3 transition-colors hover:border-theme-brand/40">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Mua ngay
                </p>
                <p className="mt-2 text-base font-semibold text-theme-heading">
                  {buyNowPriceLabel}
                </p>
              </div>
            </div>
          </article>

          <LiveBidHistory
            auctionId={auction.id}
            suggestedBidAmount={suggestedBidAmount}
            minBidIncrement={normalizedMinIncrement}
          />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
