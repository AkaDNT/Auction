"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapAuctionApiItemToSummary } from "@/features/auction/services/auction.mapper";
import { listFeaturedAuctions } from "@/features/auction/services/list-auctions";
import type { AuctionSummary } from "@/features/auction/types/auction";

type UseFeaturedAuctionsResult = {
  auctions: AuctionSummary[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useFeaturedAuctions(enabled = true): UseFeaturedAuctionsResult {
  const query = useQuery({
    queryKey: ["featured-auctions"],
    queryFn: () => listFeaturedAuctions(),
    enabled,
  });

  const auctions = useMemo(
    () => (query.data?.items ?? []).map(mapAuctionApiItemToSummary),
    [query.data?.items],
  );

  return {
    auctions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
  };
}
