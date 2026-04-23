import type { AuctionSortBy } from "@/features/auction/types/auction-api";
import { sortOptions } from "@/features/auction/components/market-flow/constants";

type AuctionSortToolbarProps = {
  sortBy: AuctionSortBy;
  onSortByChange: (value: AuctionSortBy) => void;
};

export function AuctionSortToolbar({
  sortBy,
  onSortByChange,
}: AuctionSortToolbarProps) {
  return (
    <section className="theme-card rounded-2xl p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
          Sắp xếp
        </span>
        <select
          value={sortBy}
          onChange={(event) =>
            onSortByChange(event.target.value as AuctionSortBy)
          }
          className="rounded-lg border border-(--border) bg-(--panel) px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--primary)/40"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
