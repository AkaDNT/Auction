"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapAuctionApiItemToSummary } from "@/features/auction/services/auction.mapper";
import { listAuctions } from "@/features/auction/services/list-auctions";
import type { AuctionSummary } from "@/features/auction/types/auction";
import type { AuctionListParams } from "@/features/auction/types/auction-api";

type UseAuctionsResult = {
  auctions: AuctionSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useAuctions(params?: AuctionListParams): UseAuctionsResult {
  const requestedPage = params?.page ?? 1;
  const requestedLimit = params?.limit ?? 20;

  const query = useQuery({
    queryKey: ["auctions", params],
    queryFn: () => listAuctions(params),
  });

  const auctions = useMemo(
    () => (query.data?.items ?? []).map(mapAuctionApiItemToSummary),
    [query.data?.items],
  );

  return {
    auctions,
    page: query.data?.meta.page ?? requestedPage,
    limit: query.data?.meta.limit ?? requestedLimit,
    total: query.data?.meta.total ?? 0,
    totalPages: Math.max(
      1,
      Math.ceil(
        (query.data?.meta.total ?? 0) /
          (query.data?.meta.limit ?? requestedLimit),
      ),
    ),
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
  };
}
