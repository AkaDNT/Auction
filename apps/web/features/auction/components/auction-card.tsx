import Link from "next/link";
import Image from "next/image";
import { CountdownText } from "./countdown-text";

import type { AuctionSummary } from "../types/auction";

type AuctionCardProps = {
  auction: AuctionSummary;
  featured?: boolean;
};

export function AuctionCard({ auction, featured = false }: AuctionCardProps) {
  return (
    <article
      className={`group theme-card rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${
        featured ? "p-6" : "p-5"
      }`}
    >
      <div
        className={`relative mb-4 overflow-hidden rounded-xl border border-theme-line ${
          featured ? "h-56 sm:h-72" : "h-44"
        }`}
      >
        <Image
          src={auction.imageUrl}
          alt={auction.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 66vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
            {auction.category}
          </span>
          <span className="rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
            <CountdownText timeEnd={auction.timeEnd} />
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3
          className={`font-semibold text-theme-heading ${featured ? "text-2xl" : "text-lg"}`}
        >
          {auction.title}
        </h3>

        <div className="theme-surface-strong rounded-xl p-4 text-sm grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">
              Giá hiện tại
            </p>
            <p className="font-semibold text-theme-heading">
              {auction.currentBid}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-theme-muted">
              Còn lại
            </p>
            <p className="font-semibold text-theme-heading">
              <CountdownText timeEnd={auction.timeEnd} />
            </p>
          </div>
        </div>

        <p className="text-sm text-theme-muted">Người bán: {auction.seller}</p>

        <div className="flex gap-3">
          <Link
            href={`/auctions/${auction.id}/live`}
            className="btn-primary w-full justify-center text-xs"
          >
            Vào phòng live
          </Link>
          <Link
            href={`/auctions/${auction.id}`}
            className="btn-secondary w-full justify-center text-xs"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}
