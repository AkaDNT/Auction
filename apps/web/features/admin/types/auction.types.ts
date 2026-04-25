/**
 * Admin Auction Types
 * SOLID: Separated from other domain types
 */

export type AuctionStatus =
  | "DRAFT"
  | "UPCOMING"
  | "LIVE"
  | "ENDED"
  | "CANCELLED";

export interface AdminAuction {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  status: AuctionStatus;
  startingPrice: number;
  buyNowPrice?: number;
  minBidIncrement: number;
  currentPrice?: number;
  thumbnailUrl?: string;
  imageCount: number;
  startAt: string;
  endAt: string;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  currentBidCount: number;
  currentHighestBid?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuctionListRequest {
  page?: number;
  limit?: number;
  status?: AuctionStatus;
  categoryId?: string;
  sellerSearch?: string;
  sortBy?: "createdAt" | "startAt" | "endAt" | "currentHighestBid";
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface AdminAuctionListResponse {
  data: AdminAuction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AdminAuctionCancelRequest {
  reason?: string;
}

export interface AdminAuctionCancelResponse {
  id: string;
  status: "CANCELLED";
  cancelledAt: string;
}
