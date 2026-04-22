import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = auctionCategories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Danh mục không tồn tại | Vinabid Store",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `Đấu giá ${category.label} | Phiên đang mở | Vinabid Store`;
  const description = `Xem các lô đấu giá ${category.label.toLowerCase()} đang mở, giá hiện tại và thời gian kết thúc để tham gia đặt giá trực tuyến minh bạch.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/auctions/category/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/auctions/category/${category.slug}`,
      type: "website",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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

        <section className="mb-6 rounded-2xl border border-theme-line bg-theme-panel p-5 text-sm leading-7 text-theme-body">
          <h2 className="text-base font-semibold text-theme-heading">
            Đấu giá {getCategoryLabel(slug).toLowerCase()} trực tuyến minh bạch
          </h2>
          <p className="mt-2">
            Theo dõi phiên đấu giá theo thời gian thực, cập nhật mức giá mới nhất
            và tham gia đặt giá ngay trên nền tảng Vinabid Store. Mỗi lô đều có
            thông tin rõ ràng về thời gian kết thúc, giá hiện tại và lịch sử
            giao dịch để người mua đưa ra quyết định chính xác.
          </p>
          <p className="mt-2">
            Bạn có thể quay lại trang danh sách tổng để khám phá thêm nhiều phiên
            đấu giá theo ngành hàng khác và mở rộng cơ hội mua bán tài sản giá
            trị cao.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/auctions" className="btn-secondary">
              Xem tất cả phiên đấu giá
            </Link>
          </div>
        </section>

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
