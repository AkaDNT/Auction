import type {
  AuctionApiItem,
  AuctionApiCategory,
  AuctionListParams,
  AuctionListResponse,
} from "@/features/auction/types/auction-api";

export interface AuctionGateway {
  listAuctions(params?: AuctionListParams): Promise<AuctionListResponse>;
  getAuctionById(id: string): Promise<AuctionApiItem | null>;
  listFeaturedAuctions(): Promise<AuctionListResponse>;
  listAuctionCategories(): Promise<AuctionApiCategory[]>;
}
