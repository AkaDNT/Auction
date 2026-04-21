"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listSellerAuctions } from "@/features/auction/services/list-seller-auctions";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";

type SellerOverview = {
  total: number;
  live: number;
  draft: number;
  ended: number;
};

type UseSellerDashboardResult = {
  overview: SellerOverview;
  recentAuctions: AuctionApiItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

export function useSellerDashboard(): UseSellerDashboardResult {
  const query = useQuery({
    queryKey: ["seller-dashboard"],
    queryFn: async () => {
      const [total, live, draft, ended, recent] = await Promise.all([
        listSellerAuctions({ page: 1, limit: 1 }),
        listSellerAuctions({ page: 1, limit: 1, status: "LIVE" }),
        listSellerAuctions({ page: 1, limit: 1, status: "DRAFT" }),
        listSellerAuctions({ page: 1, limit: 1, status: "ENDED" }),
        listSellerAuctions({ page: 1, limit: 5, sortBy: "NEWEST" }),
      ]);

      return {
        overview: {
          total: total.meta.total,
          live: live.meta.total,
          draft: draft.meta.total,
          ended: ended.meta.total,
        },
        recentAuctions: recent.items,
      };
    },
  });

  const overview = useMemo(
    () =>
      query.data?.overview ?? {
        total: 0,
        live: 0,
        draft: 0,
        ended: 0,
      },
    [query.data?.overview],
  );

  return {
    overview,
    recentAuctions: query.data?.recentAuctions ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: (query.error as Error | null) ?? null,
  };
}
