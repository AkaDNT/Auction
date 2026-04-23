"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type {
  AuctionApiStatus,
  AuctionEndTimeFilter,
  AuctionListParams,
  AuctionPriceRangeFilter,
  AuctionSortBy,
} from "@/features/auction/types/auction-api";
import { AUCTIONS_PER_PAGE } from "@/features/auction/components/market-flow/constants";

type UseAuctionsMarketFiltersResult = {
  currentPage: number;
  searchInput: string;
  categoryId: string;
  priceRangeFilter: AuctionPriceRangeFilter;
  statusFilter: "" | AuctionApiStatus;
  endTimeFilter: AuctionEndTimeFilter;
  sortBy: AuctionSortBy;
  sellerSlugInput: string;
  queryParams: AuctionListParams;
  hasActiveFilters: boolean;
  setCurrentPage: (page: number) => void;
  setSearchInput: (value: string) => void;
  setCategoryId: (value: string) => void;
  setPriceRangeFilter: (value: AuctionPriceRangeFilter) => void;
  setStatusFilter: (value: "" | AuctionApiStatus) => void;
  setEndTimeFilter: (value: AuctionEndTimeFilter) => void;
  setSortBy: (value: AuctionSortBy) => void;
  setSellerSlugInput: (value: string) => void;
  clearAllFilters: () => void;
};

export function useAuctionsMarketFilters(): UseAuctionsMarketFiltersResult {
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

  return {
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
  };
}
