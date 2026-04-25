/**
 * Admin Bid Types
 * SOLID: Separated from other domain types
 */

export type BidStatus = "ACTIVE" | "REJECTED" | "CANCELLED" | "PENDING";

export interface AdminBid {
  id: string;
  auctionId: string;
  auctionTitle: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  status: BidStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBidListRequest {
  page?: number;
  limit?: number;
  auctionId?: string;
  status?: BidStatus;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface AdminBidListResponse {
  data: AdminBid[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface RejectBidRequest {
  reason?: string;
}

export interface RejectBidResponse {
  id: string;
  status: "REJECTED";
  rejectionReason?: string;
  rejectedAt: string;
}

export interface CancelBidRequest {
  reason?: string;
}

export interface CancelBidResponse {
  id: string;
  status: "CANCELLED";
  cancelledAt: string;
}
