import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { CountdownText } from "@/features/auction/components/countdown-text";
import { getAuctionById } from "@/features/auction/mocks/auctions.mock";
import { SiteFooter } from "@/features/landing/components/site-footer";

type AuctionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AuctionDetailPage({
  params,
}: AuctionDetailPageProps) {
  const { id } = await params;
  const auction = getAuctionById(id);

  if (!auction) {
    notFound();
  }

  return (
    <main className="theme-bg min-h-screen text-theme-body">
      <AuctionsNavbar />

      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-3xl border border-theme-line bg-theme-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
              Chi tiết lô đấu giá
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold text-theme-heading sm:text-4xl">
              {auction.title}
            </h1>

            <div className="relative mt-5 h-52 overflow-hidden rounded-2xl border border-theme-line sm:h-64">
              <Image
                src={auction.imageUrl}
                alt={auction.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-theme-muted sm:text-base">
              Lô hàng được kiểm định bởi đội ngũ vận hành, đầy đủ chứng từ và
              được mở đấu giá theo chuẩn quy trình doanh nghiệp.
            </p>

            <dl className="mt-6 grid gap-3 rounded-2xl border border-theme-line bg-theme-bg p-4 text-sm sm:grid-cols-2">
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
                  Giá hiện tại
                </dt>
                <dd className="font-semibold text-theme-heading">
                  {auction.currentBid}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Thời gian còn lại
                </dt>
                <dd className="font-semibold text-theme-heading">
                  <CountdownText timeEnd={auction.timeEnd} />
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
            </dl>
          </article>

          <aside className="rounded-3xl border border-theme-line bg-theme-panel p-6">
            <h2 className="text-xl font-semibold text-theme-heading">
              Thao tác nhanh
            </h2>
            <p className="mt-2 text-sm text-theme-muted">
              Đăng nhập để đặt lệnh hoặc vào phòng live để theo dõi biến động
              theo giây.
            </p>
            <div className="mt-5 space-y-3">
              <Link
                href={`/auctions/${auction.id}/live`}
                className="btn-primary w-full justify-center"
              >
                Vào phòng live
              </Link>
              <Link
                href="/login"
                className="btn-secondary w-full justify-center"
              >
                Đăng nhập để đặt lệnh
              </Link>
              <Link
                href="/auctions"
                className="btn-secondary w-full justify-center"
              >
                Quay lại danh sách
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
