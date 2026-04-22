import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuctionImageGallery } from "@/features/auction/components/auction-image-gallery";
import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { CountdownText } from "@/features/auction/components/countdown-text";
import { mapAuctionApiItemToSummary } from "@/features/auction/services/auction.mapper";
import { getAuctionById } from "@/features/auction/services/list-auctions";
import { SiteFooter } from "@/features/landing/components/site-footer";
import Link from "next/link";

type AuctionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AuctionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const auctionItem = await getAuctionById(id);

  if (!auctionItem) {
    return {
      title: "Lô đấu giá không tồn tại | Vinabid Store",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${auctionItem.title} | Đấu giá trực tuyến | Vinabid Store`;
  const description =
    auctionItem.description?.trim() ||
    `Theo dõi lô đấu giá ${auctionItem.title}, cập nhật giá theo thời gian thực và tham gia đặt giá minh bạch trên Vinabid Store.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/auctions/${auctionItem.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/auctions/${auctionItem.id}`,
      type: "article",
      locale: "vi_VN",
      images: auctionItem.thumbnailUrl ? [auctionItem.thumbnailUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

export default async function AuctionDetailPage({
  params,
}: AuctionDetailPageProps) {
  const { id } = await params;
  const auctionItem = await getAuctionById(id);

  if (!auctionItem) {
    notFound();
  }

  const auction = mapAuctionApiItemToSummary(auctionItem);
  const orderedAuctionImages = [...auctionItem.images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    return left.sortOrder - right.sortOrder;
  });
  const galleryImages = [
    ...(auctionItem.thumbnailUrl ? [auctionItem.thumbnailUrl] : []),
    ...orderedAuctionImages.map((image) => image.imageUrl),
    auction.imageUrl,
  ];
  const hasLiveCountdown = auctionItem.status === "LIVE";
  const statusLabel =
    auctionItem.status === "CANCELLED"
      ? "Đã hủy"
      : auctionItem.status === "ENDED"
        ? "Đã kết thúc"
        : "Sắp tới";
  const description =
    auctionItem.description?.trim() ||
    "Lô hàng được kiểm định bởi đội ngũ vận hành, đầy đủ chứng từ và được mở đấu giá theo chuẩn quy trình doanh nghiệp.";
  const startingPriceLabel = toCurrencyLabel(auctionItem.startingPrice);
  const buyNowPriceLabel = toCurrencyLabel(auctionItem.buyNowPrice);
  const minBidIncrementLabel = toCurrencyLabel(auctionItem.minBidIncrement);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().match(/^https?:\/\//)
    ? process.env.NEXT_PUBLIC_SITE_URL.trim()
    : "https://example.com";
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: auctionItem.title,
    description,
    sku: auctionItem.code,
    image: galleryImages,
    brand: {
      "@type": "Brand",
      name: "Vinabid Store",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/auctions/${auctionItem.id}`,
      priceCurrency: "VND",
      price: Number(auctionItem.currentPrice ?? auctionItem.startingPrice) || 0,
      availability:
        auctionItem.status === "LIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/LimitedAvailability",
    },
  };

  return (
    <main className="min-h-screen text-theme-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
      <AuctionsNavbar />

      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
        <article className="rounded-3xl border border-theme-line bg-theme-panel p-6 dark:border-[color-mix(in_srgb,var(--primary)_32%,var(--border))] dark:shadow-[0_24px_60px_color-mix(in_srgb,var(--glow)_75%,transparent)]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-theme-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
                Chi tiết lô đấu giá
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold text-theme-heading sm:text-4xl">
                {auction.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-[color:var(--primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading">
                {hasLiveCountdown ? "Đang diễn ra" : statusLabel}
              </span>
            </div>
          </div>

          <AuctionImageGallery images={galleryImages} title={auction.title} />

          <section className="mt-6 space-y-3 rounded-2xl border border-theme-line bg-theme-bg p-5 dark:border-[color-mix(in_srgb,var(--primary)_26%,var(--border))] dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--glow)_86%,transparent),color-mix(in_srgb,var(--primary-soft)_76%,transparent))]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted dark:text-theme-brand">
              Mô tả lô hàng
            </p>
            <p className="text-sm leading-relaxed text-theme-body sm:text-base">
              {description}
            </p>
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-4 dark:border-[color-mix(in_srgb,var(--primary)_24%,var(--border))] dark:bg-[color-mix(in_srgb,var(--primary-soft)_72%,transparent)]">
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Giá hiện tại
              </p>
              <p className="mt-2 text-base font-semibold text-theme-heading">
                {auction.currentBid}
              </p>
            </div>
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-4 dark:border-[color-mix(in_srgb,var(--primary)_24%,var(--border))] dark:bg-[color-mix(in_srgb,var(--primary-soft)_72%,transparent)]">
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Giá khởi điểm
              </p>
              <p className="mt-2 text-base font-semibold text-theme-heading">
                {startingPriceLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-4 dark:border-[color-mix(in_srgb,var(--primary)_24%,var(--border))] dark:bg-[color-mix(in_srgb,var(--primary-soft)_72%,transparent)]">
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Mua ngay
              </p>
              <p className="mt-2 text-base font-semibold text-theme-heading">
                {buyNowPriceLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-4 dark:border-[color-mix(in_srgb,var(--primary)_24%,var(--border))] dark:bg-[color-mix(in_srgb,var(--primary-soft)_72%,transparent)]">
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Bước giá tối thiểu
              </p>
              <p className="mt-2 text-base font-semibold text-theme-heading">
                {minBidIncrementLabel}
              </p>
            </div>
          </section>

          <dl className="mt-6 grid gap-3 gap-x-45 rounded-2xl border border-theme-line bg-theme-bg p-4 text-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-[color-mix(in_srgb,var(--primary)_24%,var(--border))] dark:bg-[color-mix(in_srgb,var(--primary-soft)_62%,transparent)]">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Danh mục
              </dt>
              <dd className="font-semibold text-theme-heading">
                {auction.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Slug
              </dt>
              <dd className="font-semibold text-theme-heading">
                <span className="rounded-md border border-theme-line bg-theme-panel px-2 py-0.5 text-xs tracking-wide text-theme-muted">
                  {auctionItem.slug}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                {hasLiveCountdown ? "Thời gian còn lại" : "Trạng thái"}
              </dt>
              <dd className="font-semibold text-theme-heading">
                {hasLiveCountdown ? (
                  <CountdownText timeEnd={auction.timeEnd} />
                ) : (
                  statusLabel
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Người bán
              </dt>
              <dd className="font-semibold text-theme-heading">
                {auction.seller}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                Tổng lượt đặt giá
              </dt>
              <dd className="font-semibold text-theme-heading">
                {auction.bidCount}
              </dd>
            </div>
            <div>
              {hasLiveCountdown ? (
                <Link
                  href={`/auctions/${auction.id}/live`}
                  className="inline-flex items-center justify-center rounded-xl border border-theme-brand bg-theme-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand-foreground shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-(--primary-strong) hover:shadow-[0_14px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                >
                  Vào phòng live
                </Link>
              ) : null}
            </div>
          </dl>
        </article>
      </section>

      <SiteFooter />
    </main>
  );
}
