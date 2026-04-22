import { authHttpFetch } from "@/features/auth/services/auth-http.client";

type CreateSellerAuctionPayload = {
  title: string;
  description?: string;
  startingPrice: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startAt?: string;
  endAt: string;
  thumbnailUrl?: string;
  categoryId: string;
};

type CreateSellerAuctionResponse = {
  id: string;
};

export async function createSellerAuction(
  payload: CreateSellerAuctionPayload,
): Promise<CreateSellerAuctionResponse> {
  const response = await authHttpFetch("/seller/auctions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: {
        message?: string;
      };
      message?: string;
    } | null;

    throw new Error(
      data?.error?.message ??
        data?.message ??
        "Không thể tạo phiên đấu giá. Vui lòng thử lại.",
    );
  }

  return (await response.json()) as CreateSellerAuctionResponse;
}

export type { CreateSellerAuctionPayload };
