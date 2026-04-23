"use client";

import Link from "next/link";
import { useMemo, useState, useDeferredValue, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import { useQuery } from "@tanstack/react-query";
import { listSellerAuctions } from "@/features/auction/services/list-seller-auctions";
import type { AuctionApiStatus } from "@/features/auction/types/auction-api";
import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";

const PAGE_SIZE = 10;

type SellerFilterStatus =
  | "ALL"
  | "DRAFT"
  | "UPCOMING"
  | "LIVE"
  | "ENDED"
  | "CANCELLED";

function toStatusLabel(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "Đang diễn ra";
  }

  if (status === "DRAFT") {
    return "Nháp";
  }

  if (status === "ENDED") {
    return "Đã kết thúc";
  }

  if (status === "UPCOMING") {
    return "Sắp diễn ra";
  }

  return "Đã hủy";
}

function statusBadgeClass(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "bg-theme-brand text-theme-brand-foreground";
  }

  if (status === "DRAFT") {
    return "border border-theme-line theme-muted";
  }

  if (status === "ENDED") {
    return "border border-theme-line text-theme-body";
  }

  return "border border-theme-line theme-muted";
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Không xác định";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "0 VND";
  }

  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

function parseStatusParam(value: string | null): SellerFilterStatus {
  if (
    value === "DRAFT" ||
    value === "UPCOMING" ||
    value === "LIVE" ||
    value === "ENDED" ||
    value === "CANCELLED"
  ) {
    return value;
  }

  return "ALL";
}

function parsePageParam(value: string | null): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function parseCategoryParam(value: string | null): string {
  if (!value?.trim()) {
    return "ALL";
  }

  return value;
}

export default function SellerAuctionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [status, setStatus] = useState<SellerFilterStatus>(() =>
    parseStatusParam(searchParams.get("status")),
  );
  const [categoryId, setCategoryId] = useState<string>(() =>
    parseCategoryParam(searchParams.get("categoryId")),
  );
  const [page, setPage] = useState(() =>
    parsePageParam(searchParams.get("page")),
  );
  const auctionsTableRef = useRef<HTMLDivElement | null>(null);
  const hasPageMountedRef = useRef(false);
  const hasHydratedFromUrlRef = useRef(false);
  const hasSyncedUrlRef = useRef(false);

  const deferredSearchInput = useDeferredValue(debouncedSearchInput);
  const normalizedSearch = deferredSearchInput.trim();

  const categoriesQuery = useAuctionCategories();

  const auctionsQuery = useQuery({
    queryKey: [
      "seller-auctions-page",
      { status, categoryId, normalizedSearch, page },
    ],
    queryFn: () =>
      listSellerAuctions({
        page,
        limit: PAGE_SIZE,
        status: status === "ALL" ? undefined : status,
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        search: normalizedSearch || undefined,
      }),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  const auctions = auctionsQuery.data?.items ?? [];
  const meta = auctionsQuery.data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : page;

  useEffect(() => {
    if (!meta) {
      return;
    }

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [meta, page, totalPages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput]);

  useEffect(() => {
    const nextStatus = parseStatusParam(searchParams.get("status"));
    const nextCategoryId = parseCategoryParam(searchParams.get("categoryId"));
    const nextPage = parsePageParam(searchParams.get("page"));
    const nextSearch = searchParams.get("search") ?? "";

    setStatus((current) => (current === nextStatus ? current : nextStatus));
    setCategoryId((current) =>
      current === nextCategoryId ? current : nextCategoryId,
    );
    setPage((current) => (current === nextPage ? current : nextPage));
    setSearchInput((current) =>
      current === nextSearch ? current : nextSearch,
    );
    setDebouncedSearchInput((current) =>
      current === nextSearch ? current : nextSearch,
    );
    hasHydratedFromUrlRef.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!hasHydratedFromUrlRef.current) {
      return;
    }

    if (!hasSyncedUrlRef.current) {
      hasSyncedUrlRef.current = true;
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (status === "ALL") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    if (categoryId === "ALL") {
      params.delete("categoryId");
    } else {
      params.set("categoryId", categoryId);
    }

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    if (!normalizedSearch) {
      params.delete("search");
    } else {
      params.set("search", normalizedSearch);
    }

    const current = searchParams.toString();
    const next = params.toString();

    if (next !== current) {
      router.replace(next ? `/seller/auctions?${next}` : "/seller/auctions", {
        scroll: false,
      });
    }
  }, [categoryId, normalizedSearch, page, router, searchParams, status]);

  useEffect(() => {
    if (!hasPageMountedRef.current) {
      hasPageMountedRef.current = true;
      return;
    }

    auctionsTableRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [page]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let current = start; current <= end; current += 1) {
      pages.push(current);
    }

    return pages;
  }, [page, totalPages]);

  return (
    <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-wrap lg:items-start lg:justify-between lg:flex-row">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Phiên đấu giá người bán
          </p>
          <h1 className="mt-2 text-lg font-semibold theme-heading sm:mt-2 sm:text-2xl md:text-3xl lg:mt-3">
            Quản lý danh sách phiên đấu giá
          </h1>
          <p className="mt-1 text-xs theme-muted sm:mt-1.5 sm:text-sm">
            Lọc theo trạng thái, danh mục, tìm kiếm nhanh và theo dõi phân
            trang.
          </p>
        </div>
        <Link
          href="/seller/auctions/new"
          className="theme-button-primary inline-flex rounded-full px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap mt-2 sm:mt-0"
        >
          Tạo phiên đấu giá
        </Link>
      </div>

      <div className="mt-4 grid gap-2 sm:gap-3 md:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
            Tìm kiếm
          </span>
          <input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Nhập tên phiên hoặc mã phiên"
            className="w-full rounded-lg sm:rounded-xl border border-theme-line bg-transparent px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-(--border)"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
            Trạng thái
          </span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as SellerFilterStatus);
              setPage(1);
            }}
            className="w-full rounded-lg sm:rounded-xl border border-theme-line bg-transparent px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-(--border)"
          >
            <option value="ALL">Tất cả</option>
            <option value="DRAFT">Nháp</option>
            <option value="UPCOMING">Sắp diễn ra</option>
            <option value="LIVE">Đang diễn ra</option>
            <option value="ENDED">Đã kết thúc</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
            Danh mục
          </span>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg sm:rounded-xl border border-theme-line bg-transparent px-2.5 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-(--border)"
          >
            <option value="ALL">Tất cả danh mục</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {getVietnameseCategoryLabel(category.slug, category.label)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        ref={auctionsTableRef}
        className="mt-4 sm:mt-5 lg:mt-6 overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl border border-theme-line"
      >
        <div className="divide-y divide-theme-line">
          {auctionsQuery.isLoading ? (
            <div className="space-y-2 sm:space-y-3 p-2 sm:p-3 md:p-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="rounded-lg sm:rounded-xl border border-theme-line p-2 sm:p-3"
                >
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-(--primary-soft)" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded-md bg-(--primary-soft)" />
                </div>
              ))}
            </div>
          ) : null}

          {!auctionsQuery.isLoading && auctions.length === 0 ? (
            <div className="p-4 sm:p-5 md:p-6">
              <p className="text-xs sm:text-sm theme-muted">
                Không có phiên đấu giá phù hợp với bộ lọc hiện tại.
              </p>
            </div>
          ) : null}

          {auctions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[20%]" />
                  <col className="w-[20%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead className="bg-(--primary-soft)">
                  <tr className="border-b border-theme-line text-xs font-semibold uppercase tracking-[0.2em] theme-muted">
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-left">
                      Phiên đấu giá
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-center">
                      Trạng thái
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-left">
                      Kết thúc
                    </th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-right">
                      Giá hiện tại
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr
                      key={auction.id}
                      tabIndex={0}
                      role="link"
                      onClick={() => {
                        void router.push(`/seller/auctions/${auction.id}`);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void router.push(`/seller/auctions/${auction.id}`);
                        }
                      }}
                      className="cursor-pointer border-b border-theme-line transition hover:bg-(--primary-soft) focus:outline-none focus:ring-2 focus:ring-(--border) focus:ring-inset"
                    >
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 align-middle">
                        <div className="min-w-0">
                          <p className="truncate text-xs sm:text-sm font-semibold theme-heading">
                            {auction.title}
                          </p>
                          <p className="mt-0.5 text-xs theme-muted">
                            Mã phiên: {auction.code}
                          </p>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 align-middle text-center">
                        <span
                          className={`inline-flex h-6 sm:h-7 md:h-8 min-w-25 sm:min-w-29.5 items-center justify-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-center text-xs font-semibold tracking-[0.18em] uppercase ${statusBadgeClass(
                            auction.status,
                          )}`}
                        >
                          {toStatusLabel(auction.status)}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 align-middle text-xs sm:text-sm theme-muted">
                        {formatDateTime(auction.endAt)}
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 align-middle text-right text-xs sm:text-sm font-semibold theme-heading">
                        {formatCurrency(
                          auction.currentPrice ?? auction.startingPrice,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>

      {auctionsQuery.isError ? (
        <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-theme-line px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-xs sm:text-sm text-red-600">
            {auctionsQuery.error instanceof Error
              ? auctionsQuery.error.message
              : "Không thể tải danh sách phiên đấu giá. Vui lòng thử lại."}
          </p>
          <button
            type="button"
            onClick={() => {
              void auctionsQuery.refetch();
            }}
            className="mt-2 sm:mt-3 inline-flex cursor-pointer rounded-lg border border-theme-line px-3 py-1.5 text-xs sm:text-sm theme-muted transition hover:bg-(--primary-soft)"
          >
            Thử lại
          </button>
        </div>
      ) : null}

      <div className="mt-3 sm:mt-4 lg:mt-4 flex flex-col gap-2 sm:gap-3 rounded-lg sm:rounded-xl lg:rounded-2xl border border-theme-line bg-(--primary-soft)/35 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-xs sm:text-sm theme-muted">
          {total === 0
            ? "Chưa có phiên đấu giá nào"
            : `Trang ${page}/${totalPages} • Tổng ${total} phiên`}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1 || auctionsQuery.isLoading}
            className="inline-flex h-8 sm:h-9 min-w-16 sm:min-w-20 items-center justify-center rounded-lg border border-theme-line bg-transparent px-2 sm:px-3 text-xs sm:text-sm theme-muted transition hover:bg-(--primary-soft) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>

          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              disabled={auctionsQuery.isLoading}
              className={`inline-flex h-8 sm:h-9 min-w-8 sm:min-w-9 items-center justify-center rounded-lg border px-2 sm:px-3 text-xs sm:text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                pageNumber === page
                  ? "border-(--border) bg-(--primary-soft) font-semibold theme-heading"
                  : "border-theme-line bg-transparent theme-muted hover:bg-(--primary-soft)"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages || auctionsQuery.isLoading}
            className="inline-flex h-8 sm:h-9 min-w-16 sm:min-w-20 items-center justify-center rounded-lg border border-theme-line bg-transparent px-2 sm:px-3 text-xs sm:text-sm theme-muted transition hover:bg-(--primary-soft) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  );
}
