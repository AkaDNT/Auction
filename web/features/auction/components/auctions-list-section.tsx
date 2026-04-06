import { liveAuctions } from "../mocks/auctions.mock";
import { AuctionCard } from "./auction-card";
import { AuctionSpotlightCard } from "./auction-spotlight-card";

export function AuctionsListSection() {
  const [featuredAuction, ...otherAuctions] = liveAuctions;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
            Danh sách phiên
          </p>
          <h2 className="font-display text-2xl font-semibold text-theme-heading sm:text-3xl">
            Phiên đang mở lệnh theo thời gian thực
          </h2>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-theme-muted sm:text-sm">
          {liveAuctions.length} phiên trực tuyến
        </p>
      </div>

      {featuredAuction ? (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
            Phiên spotlight
          </p>
          <div className="mt-4">
            <AuctionSpotlightCard auction={featuredAuction} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {otherAuctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </section>
  );
}
