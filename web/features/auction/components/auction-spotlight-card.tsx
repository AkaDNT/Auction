import Link from "next/link";
import Image from "next/image";
import { CountdownText } from "./countdown-text";

import type { AuctionSummary } from "../types/auction";

type AuctionSpotlightCardProps = {
  auction: AuctionSummary;
};

export function AuctionSpotlightCard({ auction }: AuctionSpotlightCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-theme-line bg-theme-panel">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[18rem] sm:min-h-[22rem]">
          <Image
            src={auction.imageUrl}
            alt={auction.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 64vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/25 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur">
            Phiên spotlight
          </div>
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
              {auction.category}
            </p>
            <h3 className="max-w-2xl text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {auction.title}
            </h3>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">
                Giá hiện tại
              </p>
              <p className="mt-1 text-lg font-semibold text-theme-heading">
                {auction.currentBid}
              </p>
            </div>
            <div className="rounded-2xl border border-theme-line bg-theme-bg p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">
                Đếm ngược
              </p>
              <p className="mt-1 text-lg font-semibold text-theme-heading">
                <CountdownText timeEnd={auction.timeEnd} />
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-theme-line bg-theme-bg p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">
              Người bán
            </p>
            <p className="mt-1 font-semibold text-theme-heading">
              {auction.seller}
            </p>
            <p className="mt-2 text-sm text-theme-muted">
              Hồ sơ đã xác thực, đủ điều kiện vận hành trong phiên live theo
              chuẩn doanh nghiệp.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={`/auctions/${auction.id}/live`}
              className="btn-primary w-full justify-center"
            >
              Vào phòng live
            </Link>
            <Link
              href={`/auctions/${auction.id}`}
              className="btn-secondary w-full justify-center"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
