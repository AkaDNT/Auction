/**
 * Admin Bid Service
 * SOLID: Single Responsibility - manages bid API calls
 * Dependency: API client, types
 */

import type {
  AdminBid,
  AdminBidListRequest,
  AdminBidListResponse,
  RejectBidRequest,
  RejectBidResponse,
  CancelBidRequest,
  CancelBidResponse,
} from "@/features/admin/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function listAdminBids(
  request: AdminBidListRequest = {},
): Promise<AdminBidListResponse> {
  const params = new URLSearchParams();

  if (request.page) params.append("page", String(request.page));
  if (request.limit) params.append("limit", String(request.limit));
  if (request.auctionId) params.append("auctionId", request.auctionId);
  if (request.status) params.append("status", request.status);
  if (request.sortBy) params.append("sortBy", request.sortBy);
  if (request.sortOrder) params.append("sortOrder", request.sortOrder);
  if (request.search) params.append("search", request.search);

  const response = await fetch(`${API_BASE}/admin/bids?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bids");
  }

  return response.json();
}

export async function getAdminBidById(bidId: string): Promise<AdminBid> {
  const response = await fetch(`${API_BASE}/admin/bids/${bidId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bid");
  }

  return response.json();
}

export async function rejectAdminBid(
  bidId: string,
  request: RejectBidRequest = {},
): Promise<RejectBidResponse> {
  const response = await fetch(`${API_BASE}/admin/bids/${bidId}/reject`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to reject bid");
  }

  return response.json();
}

export async function cancelAdminBid(
  bidId: string,
  request: CancelBidRequest = {},
): Promise<CancelBidResponse> {
  const response = await fetch(`${API_BASE}/admin/bids/${bidId}/cancel`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to cancel bid");
  }

  return response.json();
}
