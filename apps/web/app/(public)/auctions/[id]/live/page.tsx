import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { AuctionsNavbar } from "@/features/auction/components/auctions-navbar";
import { CountdownText } from "@/features/auction/components/countdown-text";
import {
  getAuctionById,
  liveBidEvents,
} from "@/features/auction/mocks/auctions.mock";
import { SiteFooter } from "@/features/landing/components/site-footer";

type LiveRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LiveRoomPage({ params }: LiveRoomPageProps) {
  const { id } = await params;
  const auction = getAuctionById(id);

  if (!auction) {
    notFound();
  }

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
          </div>
          <Link href={`/auctions/${auction.id}`} className="btn-secondary">
            Xem chi tiết lô
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <article className="rounded-3xl border border-theme-line bg-theme-panel p-6">
            <h2 className="text-xl font-semibold text-theme-heading">
              Trạng thái phiên trực tiếp
            </h2>
            <div className="relative mt-4 h-52 overflow-hidden rounded-2xl border border-theme-line sm:h-64">
              <Image
                src={auction.imageUrl}
                alt={`Phòng đấu giá ${auction.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>
            <div className="mt-4 grid gap-3 rounded-2xl border border-theme-line bg-theme-bg p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Giá hiện tại
                </p>
                <p className="font-semibold text-theme-heading">
                  {auction.currentBid}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Đếm ngược
                </p>
                <p className="font-semibold text-theme-heading">
                  <CountdownText timeEnd={auction.timeEnd} />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Người bán
                </p>
                <p className="font-semibold text-theme-heading">
                  {auction.seller}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary">
                Đặt giá nhanh +$200
              </button>
              <button type="button" className="btn-secondary">
                Đặt giá tùy chỉnh
              </button>
            </div>
          </article>

          <aside className="rounded-3xl border border-theme-line bg-theme-panel p-6">
            <h2 className="text-lg font-semibold text-theme-heading">
              Lịch sử đặt giá
            </h2>
            <ul className="mt-4 space-y-2">
              {liveBidEvents.map((event) => (
                <li
                  key={`${event.bidder}-${event.time}`}
                  className="rounded-xl border border-theme-line bg-theme-bg p-3 text-sm"
                >
                  <p className="font-semibold text-theme-heading">
                    {event.bidder}
                  </p>
                  <p className="text-theme-muted">{event.amount}</p>
                  <p className="text-xs text-theme-muted">{event.time}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
