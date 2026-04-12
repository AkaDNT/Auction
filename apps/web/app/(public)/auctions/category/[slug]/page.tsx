import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AuctionCard } from "@/features/auction/components/auction-card";
import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import {
  auctionCategories,
  getAuctionsByCategory,
  getCategoryLabel,
} from "@/features/auction/mocks/auctions.mock";
import { SiteFooter } from "@/features/landing/components/site-footer";
import { getCategoryImage } from "@/shared/lib/mock-images";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = auctionCategories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryAuctions = getAuctionsByCategory(slug);

  return (
    <main className="min-h-screen text-theme-body">
      <AuctionsNavbar />

      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
              Danh mục đấu giá
            </p>
            <h1 className="font-display text-3xl font-semibold text-theme-heading sm:text-4xl">
              {getCategoryLabel(slug)}
            </h1>
          </div>
          <Link href="/auctions" className="btn-secondary">
            Quay lại danh sách
          </Link>
        </div>

        <div className="relative mb-6 h-44 overflow-hidden rounded-3xl border border-theme-line sm:h-56">
          <Image
            src={getCategoryImage(slug)}
            alt={`Danh mục ${getCategoryLabel(slug)}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {categoryAuctions.length === 0 ? (
          <div className="rounded-2xl border border-theme-line bg-theme-panel p-6 text-sm text-theme-muted">
            Hiện chưa có phiên đấu giá khả dụng trong danh mục này.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
