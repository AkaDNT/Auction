/**
 * Admin Auction Service
 * SOLID: Single Responsibility - manages auction API calls
 * Dependency: API client, types
 */

import type {
  AdminAuction,
  AdminAuctionListRequest,
  AdminAuctionListResponse,
  AdminAuctionCancelRequest,
  AdminAuctionCancelResponse,
} from "@/features/admin/types";
import {
  listAuctions,
  getAuctionById,
} from "@/features/auction/services/list-auctions";
import type {
  AuctionApiItem,
  AuctionListParams,
} from "@/features/auction/types/auction-api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3999";

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapAuctionApiItemToAdminAuction(item: AuctionApiItem): AdminAuction {
  const itemWithMeta = item as AuctionApiItem & {
    createdAt?: string;
    updatedAt?: string;
    startAt?: string;
  };

  return {
    id: item.id,
    code: item.code,
    slug: item.slug,
    title: item.title,
    description: item.description ?? "",
    status: item.status,
    startingPrice: toNumber(item.startingPrice),
    buyNowPrice:
      item.buyNowPrice === null || item.buyNowPrice === undefined
        ? undefined
        : toNumber(item.buyNowPrice),
    minBidIncrement: toNumber(item.minBidIncrement),
    currentPrice:
      item.currentPrice === null || item.currentPrice === undefined
        ? undefined
        : toNumber(item.currentPrice),
    thumbnailUrl: item.thumbnailUrl ?? undefined,
    imageCount: item.images.length,
    startAt: itemWithMeta.startAt ?? "",
    endAt: item.endAt,
    categoryId: item.category.id,
    categoryName: item.category.label,
    sellerId: item.seller.id,
    sellerName: item.seller.name ?? item.seller.email,
    sellerEmail: item.seller.email,
    currentBidCount: item._count.bids,
    currentHighestBid:
      item.currentPrice === null || item.currentPrice === undefined
        ? undefined
        : toNumber(item.currentPrice),
    createdAt: itemWithMeta.createdAt ?? "",
    updatedAt: itemWithMeta.updatedAt ?? "",
  };
}

export async function listAdminAuctions(
  request: AdminAuctionListRequest = {},
): Promise<AdminAuctionListResponse> {
  const params: AuctionListParams = {
    page: request.page,
    limit: request.limit,
    search: request.search,
    categoryId: request.categoryId,
    status: request.status,
    sellerSlug: request.sellerSearch?.trim() || undefined,
  };

  const response = await listAuctions(params);
  const mappedData = response.items.map(mapAuctionApiItemToAdminAuction);
  const normalizedSellerSearch = request.sellerSearch?.trim().toLowerCase();

  const filteredData = normalizedSellerSearch
    ? mappedData.filter((item) =>
        item.sellerName.toLowerCase().includes(normalizedSellerSearch),
      )
    : mappedData;

  return {
    data: filteredData,
    total: normalizedSellerSearch ? filteredData.length : response.meta.total,
    page: response.meta.page,
    limit: response.meta.limit,
    hasMore: normalizedSellerSearch
      ? false
      : response.meta.page * response.meta.limit < response.meta.total,
  };
}

export async function getAdminAuctionById(
  auctionId: string,
): Promise<AdminAuction> {
  const response = await getAuctionById(auctionId);

  if (!response) {
    throw new Error("Failed to fetch auction");
  }

  return mapAuctionApiItemToAdminAuction(response);
}

export async function cancelAdminAuction(
  auctionId: string,
  request: AdminAuctionCancelRequest = {},
): Promise<AdminAuctionCancelResponse> {
  const response = await fetch(
    `${API_BASE}/admin/auctions/${auctionId}/cancel`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to cancel auction");
  }

  return response.json();
}
