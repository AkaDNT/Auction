/**
 * Admin Bids Hook
 * SOLID: Single Responsibility - manages bid data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminBids,
  getAdminBidById,
  rejectAdminBid,
  cancelAdminBid,
} from "@/features/admin/services";
import type {
  AdminBidListRequest,
  RejectBidRequest,
  CancelBidRequest,
} from "@/features/admin/types";

const BID_QUERY_KEY = ["admin", "bids"];
const BID_DETAIL_QUERY_KEY = ["admin", "bid-detail"];

export function useAdminBids(request: AdminBidListRequest = {}) {
  return useQuery({
    queryKey: [...BID_QUERY_KEY, request],
    queryFn: () => listAdminBids(request),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminBidById(bidId: string) {
  return useQuery({
    queryKey: [...BID_DETAIL_QUERY_KEY, bidId],
    queryFn: () => getAdminBidById(bidId),
    enabled: Boolean(bidId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRejectAdminBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bidId,
      request,
    }: {
      bidId: string;
      request?: RejectBidRequest;
    }) => rejectAdminBid(bidId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BID_QUERY_KEY,
      });
    },
  });
}

export function useCancelAdminBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bidId,
      request,
    }: {
      bidId: string;
      request?: CancelBidRequest;
    }) => cancelAdminBid(bidId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BID_QUERY_KEY,
      });
    },
  });
}
