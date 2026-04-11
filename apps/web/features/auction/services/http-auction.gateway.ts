import type { AuctionGateway } from "@/features/auction/services/auction-gateway";
import { auctionHttpFetch } from "@/features/auction/services/auction-http.client";
import type {
  AuctionApiCategory,
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

export class HttpAuctionGateway implements AuctionGateway {
  async listAuctions(params?: AuctionListParams): Promise<AuctionListResponse> {
    const response = await auctionHttpFetch(
      `/auctions${toQueryString(params)}`,
    );

    if (!response.ok) {
      throw new Error("Không thể tải danh sách đấu giá");
    }

    return (await response.json()) as AuctionListResponse;
  }

  async listFeaturedAuctions(): Promise<AuctionListResponse> {
    const response = await auctionHttpFetch("/auctions/featured");

    if (!response.ok) {
      throw new Error("Không thể tải phiên đấu giá nổi bật");
    }

    return (await response.json()) as AuctionListResponse;
  }

  async listAuctionCategories(): Promise<AuctionApiCategory[]> {
    const response = await auctionHttpFetch("/auction-categories");

    if (!response.ok) {
      throw new Error("Không thể tải danh mục đấu giá");
    }

    return (await response.json()) as AuctionApiCategory[];
  }
}
