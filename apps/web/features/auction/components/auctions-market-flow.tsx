"use client";

import Image from "next/image";
import Link from "next/link";
import { CountdownText } from "./countdown-text";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useAuctions } from "@/features/auction/hooks/use-auctions";
import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import { useFeaturedAuctions } from "@/features/auction/hooks/use-featured-auctions";
import type {
  AuctionApiStatus,
  AuctionEndTimeFilter,
  AuctionPriceRangeFilter,
  AuctionSortBy,
} from "@/features/auction/types/auction-api";

const sortOptions: Array<{ label: string; value: AuctionSortBy }> = [
  { label: "Mới nhất", value: "NEWEST" },
  { label: "Sắp kết thúc", value: "ENDING_SOON" },
  { label: "Giá từ cao đến thấp", value: "HIGHEST_PRICE" },
  { label: "Giá từ thấp đến cao", value: "LOWEST_PRICE" },
];

const statusOptions: Array<{ label: string; value: AuctionApiStatus }> = [
  { label: "Đang diễn ra", value: "LIVE" },
  { label: "Sắp tới", value: "UPCOMING" },
  { label: "Đã kết thúc", value: "ENDED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const endTimeFilterOptions: Array<{
  label: string;
  value: AuctionEndTimeFilter;
}> = [
  { label: "Mọi mốc thời gian", value: "ALL" },
  { label: "Trong 1 giờ tới", value: "WITHIN_1_HOUR" },
  { label: "Trong ngày hôm nay", value: "TODAY" },
  { label: "Tuần này", value: "THIS_WEEK" },
];

const priceRangeOptions: Array<{
  label: string;
  value: AuctionPriceRangeFilter;
}> = [
  { label: "Tất cả mức giá", value: "ALL" },
  { label: "Dưới 1,000,000", value: "BELOW_1M" },
  { label: "Từ 1,000,000 đến 5,000,000", value: "FROM_1M_TO_5M" },
  { label: "Trên 5,000,000", value: "ABOVE_5M" },
];

const AUCTIONS_PER_PAGE = 12;

export function AuctionsMarketFlow() {
  const listSectionRef = useRef<HTMLElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceRangeFilter, setPriceRangeFilter] =
    useState<AuctionPriceRangeFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<"" | AuctionApiStatus>("");
  const [endTimeFilter, setEndTimeFilter] =
    useState<AuctionEndTimeFilter>("ALL");
  const [sortBy, setSortBy] = useState<AuctionSortBy>("NEWEST");
  const [sellerSlugInput, setSellerSlugInput] = useState("");

  const deferredSearchInput = useDeferredValue(searchInput.trim());
  const deferredSellerSlugInput = useDeferredValue(sellerSlugInput.trim());

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: AUCTIONS_PER_PAGE,
      search: deferredSearchInput || undefined,
      categoryId: categoryId || undefined,
      status: statusFilter || undefined,
      sellerSlug: deferredSellerSlugInput || undefined,
      priceRangeFilter,
      endTimeFilter,
      sortBy,
    }),
    [
      categoryId,
      currentPage,
      deferredSearchInput,
      deferredSellerSlugInput,
      endTimeFilter,
      priceRangeFilter,
      statusFilter,
      sortBy,
    ],
  );

  const hasActiveFilters =
    deferredSearchInput.length > 0 ||
    categoryId.length > 0 ||
    statusFilter.length > 0 ||
    deferredSellerSlugInput.length > 0 ||
    endTimeFilter !== "ALL" ||
    priceRangeFilter !== "ALL" ||
    sortBy !== "NEWEST";

  const {
    auctions: liveAuctions,
    page,
    limit,
    total,
    totalPages,
    isLoading,
    isError,
  } = useAuctions(queryParams);

  const { data: categories = [] } = useAuctionCategories();

  const {
    auctions: featuredAuctions,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
  } = useFeaturedAuctions(!hasActiveFilters);

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = total === 0 ? 0 : Math.min(page * limit, total);

  const visiblePages = useMemo(() => {
    const maxVisiblePages = 5;
    const start = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);
    const adjustedStart = Math.max(1, end - maxVisiblePages + 1);

    return Array.from(
      { length: end - adjustedStart + 1 },
      (_, index) => adjustedStart + index,
    );
  }, [page, totalPages]);

  function clearAllFilters() {
    setSearchInput("");
    setCategoryId("");
    setPriceRangeFilter("ALL");
    setStatusFilter("");
    setEndTimeFilter("ALL");
    setSortBy("NEWEST");
    setSellerSlugInput("");
    setCurrentPage(1);
  }

  function goToPage(nextPage: number) {
    setCurrentPage(nextPage);
    listSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-[2rem] theme-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-theme-brand/60 to-transparent" />
        <div className="pointer-events-none absolute -left-28 top-16 h-56 w-56 rounded-full bg-theme-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-52 w-52 rounded-full bg-theme-brand/10 blur-3xl" />

        <div className="relative space-y-6">
          <header className="space-y-3 border-b border-theme-line pb-6">
            <nav className="text-xs uppercase tracking-[0.16em] text-theme-muted">
              <Link href="/" className="transition hover:text-theme-heading">
                Trang chủ
              </Link>
              <span className="px-2">&gt;</span>
              <span className="text-theme-heading">Đấu giá</span>
            </nav>
            <h1 className="font-display text-3xl font-semibold leading-tight text-theme-heading sm:text-4xl lg:text-[2.65rem]">
              Sàn đấu giá
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-theme-muted sm:text-base">
              Khám phá và quản lý toàn bộ phiên đấu giá trong một không gian
              trực quan, từ live room đến lịch mở phiên sắp tới.
            </p>
          </header>

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
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Danh mục
                </span>
                <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
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
                  onChange={(event) => {
                    setPriceRangeFilter(
                      event.target.value as AuctionPriceRangeFilter,
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
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
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as AuctionApiStatus | "",
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
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
                  onChange={(event) => {
                    setEndTimeFilter(
                      event.target.value as AuctionEndTimeFilter,
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
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
                  onChange={(event) => {
                    setSellerSlugInput(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="btn-secondary cursor-pointer disabled:cursor-not-allowed"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
              >
                Xóa bộ lọc
              </button>
            </div>
          </section>

          <section className="theme-card rounded-2xl p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                Sắp xếp
              </span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as AuctionSortBy);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-[color:var(--primary)] bg-[color:var(--primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
              >
                Lưới
              </button>
              <button
                type="button"
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                Danh sách
              </button>
            </div>
          </section>

          {!hasActiveFilters ? (
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
                    Phiên nổi bật
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-theme-heading">
                    Phiên đấu giá nổi bật
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {isFeaturedLoading ? (
                  Array.from({ length: 2 }).map((_, index) => (
                    <article
                      key={`featured-skeleton-${index}`}
                      className="theme-card overflow-hidden rounded-2xl animate-pulse"
                    >
                      <div className="h-48 bg-theme-line/40" />
                      <div className="space-y-3 p-5">
                        <div className="h-6 w-3/4 rounded bg-theme-line/50" />
                        <div className="h-4 w-1/2 rounded bg-theme-line/40" />
                      </div>
                    </article>
                  ))
                ) : isFeaturedError ? (
                  <p className="text-sm text-theme-muted">
                    Không thể tải phiên đấu giá nổi bật.
                  </p>
                ) : featuredAuctions.length === 0 ? (
                  <p className="text-sm text-theme-muted">
                    Chưa có phiên đấu giá nổi bật.
                  </p>
                ) : (
                  featuredAuctions.map((auction) => (
                    <article
                      key={auction.id}
                      className="theme-card overflow-hidden rounded-2xl"
                    >
                      <div className="relative h-40 sm:h-44">
                        <Image
                          src={auction.imageUrl}
                          alt={auction.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <p className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
                          {auction.status}
                        </p>
                      </div>
                      <div className="space-y-3 p-4">
                        <h3 className="text-xl font-semibold text-theme-heading">
                          {auction.title}
                        </h3>
                        <p className="text-sm text-theme-muted">
                          Người bán: {auction.seller}
                        </p>

                        <div className="grid grid-cols-2 auto-rows-fr gap-3 text-sm">
                          <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                              Giá hiện tại
                            </p>
                            <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                              {auction.currentBid}
                            </p>
                          </div>
                          <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                              Giá khởi điểm
                            </p>
                            <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                              {auction.startingPrice}
                            </p>
                          </div>
                          <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                              Thời gian
                            </p>
                            <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                              <CountdownText
                                timeEnd={auction.timeEnd}
                                mode="stacked"
                                className="break-words"
                              />
                            </p>
                          </div>
                          <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                              Số lượt đặt
                            </p>
                            <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                              {auction.bidCount}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
                            {auction.status}
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <Link
                            href={`/auctions/${auction.id}`}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-[color:var(--primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading"
                          >
                            Xem chi tiết
                          </Link>
                          <Link
                            href={`/auctions/${auction.id}/live`}
                            className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand bg-[color:var(--primary)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-[color:var(--primary-strong)] hover:shadow-[0_16px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                          >
                            Đặt giá ngay
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : null}

          <section ref={listSectionRef} className="space-y-5">
            <div className="flex items-end justify-between gap-5">
              <h2 className="font-display text-2xl font-semibold text-theme-heading">
                Danh sách đấu giá
              </h2>
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                {isLoading ? "Đang tải..." : `${total} kết quả`}
              </p>
            </div>

            {isError ? (
              <div className="rounded-xl border border-red-300/40 bg-red-50/60 p-4 text-sm text-red-800">
                Không thể tải danh sách đấu giá. Vui lòng thử lại sau.
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <article
                      key={`auction-skeleton-${index}`}
                      className="rounded-2xl border border-theme-line bg-theme-panel/95 p-4 animate-pulse"
                    >
                      <div className="mb-3 h-44 rounded-xl bg-theme-line/40" />
                      <div className="h-6 w-4/5 rounded bg-theme-line/50" />
                      <div className="mt-3 h-4 w-2/3 rounded bg-theme-line/40" />
                    </article>
                  ))
                : liveAuctions.map((auction) => (
                    <article
                      key={auction.id}
                      className="group rounded-2xl border border-theme-line bg-theme-panel/95 p-4 transition-transform hover:-translate-y-1 hover:shadow-[0_18px_38px_color-mix(in_srgb,var(--primary)_16%,transparent)]"
                    >
                      <div className="relative mb-3 h-44 overflow-hidden rounded-xl border border-theme-line">
                        <Image
                          src={auction.imageUrl}
                          alt={auction.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>

                      <h3 className="line-clamp-2 text-lg font-semibold text-theme-heading">
                        {auction.title}
                      </h3>
                      <p className="mt-2 text-sm text-theme-muted">
                        Seller: {auction.seller}
                      </p>

                      <div className="mt-4 grid grid-cols-2 auto-rows-fr gap-3 text-sm">
                        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                            Giá hiện tại
                          </p>
                          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                            {auction.currentBid}
                          </p>
                        </div>
                        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                            Giá khởi điểm
                          </p>
                          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                            {auction.startingPrice}
                          </p>
                        </div>
                        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                            Thời gian
                          </p>
                          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                            <CountdownText
                              timeEnd={auction.timeEnd}
                              mode="stacked"
                              className="break-words"
                            />
                          </p>
                        </div>
                        <div className="flex h-full flex-col rounded-lg border border-theme-line bg-theme-bg p-3">
                          <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                            Số lượt đặt
                          </p>
                          <p className="mt-2 flex min-h-12 items-center font-semibold leading-tight text-theme-heading">
                            {auction.bidCount}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
                          {auction.status}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-[color:var(--primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading"
                        >
                          Xem chi tiết
                        </Link>
                        <Link
                          href={`/auctions/${auction.id}/live`}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand bg-[color:var(--primary)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-[color:var(--primary-strong)] hover:shadow-[0_16px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                        >
                          Đặt giá ngay
                        </Link>
                      </div>
                    </article>
                  ))}
            </div>

            {!isLoading && !isError && liveAuctions.length === 0 ? (
              <p className="text-sm text-theme-muted">
                Không có phiên đấu giá phù hợp với bộ lọc hiện tại.
              </p>
            ) : null}
          </section>

          <section className="flex flex-col items-center justify-center gap-4 border-t border-theme-line pt-6 sm:flex-row sm:justify-between">
            <p className="text-sm text-theme-muted">
              {isLoading
                ? "Đang tải dữ liệu trang..."
                : `Hiển thị ${startItem}-${endItem} / ${total} phiên`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || page <= 1}
                onClick={() => goToPage(Math.max(1, page - 1))}
              >
                Trước
              </button>

              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold transition ${
                    pageNumber === page
                      ? "border-theme-brand bg-theme-brand text-theme-brand-foreground"
                      : "border-theme-line bg-theme-bg text-theme-muted hover:border-theme-brand/50 hover:text-theme-heading"
                  } cursor-pointer disabled:cursor-not-allowed`}
                  disabled={isLoading}
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                className="btn-secondary cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || page >= totalPages}
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
              >
                Sau
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
