import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import type {
  AuctionListParams,
  AuctionListResponse,
} from "@/features/auction/types/auction-api";

function toQueryString(params?: AuctionListParams) {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function listSellerAuctions(
  params?: AuctionListParams,
): Promise<AuctionListResponse> {
  const response = await authHttpFetch(`/seller/auctions${toQueryString(params)}`);

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => null)) as
      | {
          error?: {
            message?: string;
          };
          message?: string;
        }
      | null;

    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        "Không thể tải dữ liệu phiên đấu giá của người bán",
    );
  }

  return (await response.json()) as AuctionListResponse;
}
