import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";

export type UpdateSellerAuctionPayload = {
  title?: string;
  description?: string;
  startingPrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startAt?: string;
  endAt?: string;
  thumbnailUrl?: string;
  categoryId?: string;
};

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

async function toErrorMessage(response: Response, fallback: string) {
  const data = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null;
  return data?.error?.message ?? data?.message ?? fallback;
}

export async function getSellerAuctionById(
  id: string,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}`);

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(
        response,
        "Không thể tải thông tin phiên đấu giá của người bán.",
      ),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function updateSellerAuction(
  id: string,
  payload: UpdateSellerAuctionPayload,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể cập nhật phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function publishSellerAuction(
  id: string,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}/publish`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể phát hành phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function cancelSellerAuction(id: string): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể hủy phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function deleteSellerAuction(id: string): Promise<void> {
  const response = await authHttpFetch(`/seller/auctions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể xóa phiên đấu giá."),
    );
  }
}
