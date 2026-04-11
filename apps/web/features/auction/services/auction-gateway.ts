import type {
  AuctionApiCategory,
  AuctionListParams,
  AuctionListResponse,
} from "@/features/auction/types/auction-api";

export interface AuctionGateway {
  listAuctions(params?: AuctionListParams): Promise<AuctionListResponse>;
  listFeaturedAuctions(): Promise<AuctionListResponse>;
  listAuctionCategories(): Promise<AuctionApiCategory[]>;
}
