import type {
  AuctionApiCategory,
  AuctionApiStatus,
  AuctionEndTimeFilter,
  AuctionPriceRangeFilter,
} from "@/features/auction/types/auction-api";
import {
  endTimeFilterOptions,
  priceRangeOptions,
  statusOptions,
} from "@/features/auction/components/market-flow/constants";
import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";

type AuctionFiltersPanelProps = {
  categories: AuctionApiCategory[];
  searchInput: string;
  categoryId: string;
  priceRangeFilter: AuctionPriceRangeFilter;
  statusFilter: "" | AuctionApiStatus;
  endTimeFilter: AuctionEndTimeFilter;
  sellerSlugInput: string;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPriceRangeChange: (value: AuctionPriceRangeFilter) => void;
  onStatusChange: (value: "" | AuctionApiStatus) => void;
  onEndTimeChange: (value: AuctionEndTimeFilter) => void;
  onSellerChange: (value: string) => void;
  onClearFilters: () => void;
};

export function AuctionFiltersPanel({
  categories,
  searchInput,
  categoryId,
  priceRangeFilter,
  statusFilter,
  endTimeFilter,
  sellerSlugInput,
  hasActiveFilters,
  onSearchChange,
  onCategoryChange,
  onPriceRangeChange,
  onStatusChange,
  onEndTimeChange,
  onSellerChange,
  onClearFilters,
}: AuctionFiltersPanelProps) {
  return (
    <section className="theme-card rounded-2xl p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Tìm sản phẩm
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={searchInput}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground placeholder-(--muted) outline-none focus:ring-2 focus:ring-(--primary)/40"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Danh mục
          </span>
          <select
            value={categoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--primary)/40"
          >
            <option value="">Tất cả</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getVietnameseCategoryLabel(category.slug, category.label)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Khoảng giá
          </span>
          <select
            value={priceRangeFilter}
            onChange={(event) =>
              onPriceRangeChange(event.target.value as AuctionPriceRangeFilter)
            }
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--primary)/40"
          >
            {priceRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Trạng thái
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as AuctionApiStatus | "")
            }
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--primary)/40"
          >
            <option value="">Tất cả trạng thái</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Thời gian kết thúc
          </span>
          <select
            value={endTimeFilter}
            onChange={(event) =>
              onEndTimeChange(event.target.value as AuctionEndTimeFilter)
            }
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-(--primary)/40"
          >
            {endTimeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
            Người bán
          </span>
          <input
            type="text"
            placeholder="Tag name người bán..."
            value={sellerSlugInput}
            onChange={(event) => onSellerChange(event.target.value)}
            className="w-full rounded-xl border border-(--border) bg-(--panel) px-3 py-2.5 text-sm text-foreground placeholder-(--muted) outline-none focus:ring-2 focus:ring-(--primary)/40"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          className="btn-secondary cursor-pointer disabled:cursor-not-allowed"
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
        >
          Xóa bộ lọc
        </button>
      </div>
    </section>
  );
}
