/**
 * Admin Auctions Hook
 * SOLID: Single Responsibility - manages auction data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminAuctions,
  getAdminAuctionById,
  cancelAdminAuction,
} from "@/features/admin/services";
import type {
  AdminAuctionListRequest,
  AdminAuctionCancelRequest,
} from "@/features/admin/types";

const AUCTION_QUERY_KEY = ["admin", "auctions"];
const AUCTION_DETAIL_QUERY_KEY = ["admin", "auction-detail"];

export function useAdminAuctions(request: AdminAuctionListRequest = {}) {
  return useQuery({
    queryKey: [...AUCTION_QUERY_KEY, request],
    queryFn: () => listAdminAuctions(request),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminAuctionById(auctionId: string) {
  return useQuery({
    queryKey: [...AUCTION_DETAIL_QUERY_KEY, auctionId],
    queryFn: () => getAdminAuctionById(auctionId),
    enabled: Boolean(auctionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCancelAdminAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      request,
    }: {
      auctionId: string;
      request?: AdminAuctionCancelRequest;
    }) => cancelAdminAuction(auctionId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: AUCTION_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...AUCTION_DETAIL_QUERY_KEY, variables.auctionId],
      });
    },
  });
}
