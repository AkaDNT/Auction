"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuctions } from "@/features/auction/hooks/use-auctions";
import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import { useFeaturedAuctions } from "@/features/auction/hooks/use-featured-auctions";
import { useAuctionsMarketFilters } from "@/features/auction/hooks/use-auctions-market-filters";
import { NavigatorConnection } from "@/features/auction/components/market-flow/constants";
import { AuctionFiltersPanel } from "@/features/auction/components/market-flow/auction-filters-panel";
import { AuctionSortToolbar } from "@/features/auction/components/market-flow/auction-sort-toolbar";
import { FeaturedAuctionCard } from "@/features/auction/components/market-flow/featured-auction-card";
import { AuctionListCard } from "@/features/auction/components/market-flow/auction-list-card";

export function AuctionsMarketFlow() {
  const listSectionRef = useRef<HTMLElement | null>(null);
  const [imageQuality, setImageQuality] = useState(70);
  const {
    currentPage,
    searchInput,
    categoryId,
    priceRangeFilter,
    statusFilter,
    endTimeFilter,
    sortBy,
    sellerSlugInput,
    queryParams,
    hasActiveFilters,
    setCurrentPage,
    setSearchInput,
    setCategoryId,
    setPriceRangeFilter,
    setStatusFilter,
    setEndTimeFilter,
    setSortBy,
    setSellerSlugInput,
    clearAllFilters,
  } = useAuctionsMarketFilters();

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const connection = (
      navigator as Navigator & { connection?: NavigatorConnection }
    ).connection;

    if (!connection) {
      return;
    }

    const updateImageQualityByNetwork = () => {
      const networkType = connection.effectiveType ?? "";
      const isLowBandwidth =
        connection.saveData === true ||
        networkType === "slow-2g" ||
        networkType === "2g";

      setImageQuality(isLowBandwidth ? 45 : 70);
    };

    updateImageQualityByNetwork();

    connection.addEventListener?.("change", updateImageQualityByNetwork);

    return () => {
      connection.removeEventListener?.("change", updateImageQualityByNetwork);
    };
  }, []);

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

  function goToPage(nextPage: number) {
    setCurrentPage(nextPage);
    listSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-4xl theme-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-theme-brand/60 to-transparent" />
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

          <AuctionFiltersPanel
            categories={categories}
            searchInput={searchInput}
            categoryId={categoryId}
            priceRangeFilter={priceRangeFilter}
            statusFilter={statusFilter}
            endTimeFilter={endTimeFilter}
            sellerSlugInput={sellerSlugInput}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={(value) => {
              setSearchInput(value);
              setCurrentPage(1);
            }}
            onCategoryChange={(value) => {
              setCategoryId(value);
              setCurrentPage(1);
            }}
            onPriceRangeChange={(value) => {
              setPriceRangeFilter(value);
              setCurrentPage(1);
            }}
            onStatusChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            onEndTimeChange={(value) => {
              setEndTimeFilter(value);
              setCurrentPage(1);
            }}
            onSellerChange={(value) => {
              setSellerSlugInput(value);
              setCurrentPage(1);
            }}
            onClearFilters={clearAllFilters}
          />

          <AuctionSortToolbar
            sortBy={sortBy}
            onSortByChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
          />

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
                    <FeaturedAuctionCard
                      key={auction.id}
                      auction={auction}
                      imageQuality={imageQuality}
                    />
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
                    <AuctionListCard
                      key={auction.id}
                      auction={auction}
                      imageQuality={imageQuality}
                    />
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
