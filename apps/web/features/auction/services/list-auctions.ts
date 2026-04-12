import type { AuctionGateway } from "@/features/auction/services/auction-gateway";
import { HttpAuctionGateway } from "@/features/auction/services/http-auction.gateway";
import type {
  AuctionApiItem,
  AuctionApiCategory,
  AuctionListParams,
  AuctionListResponse,
} from "@/features/auction/types/auction-api";

const defaultAuctionGateway = new HttpAuctionGateway();

export async function listAuctions(
  params?: AuctionListParams,
  gateway: AuctionGateway = defaultAuctionGateway,
): Promise<AuctionListResponse> {
  return gateway.listAuctions(params);
}

export async function listFeaturedAuctions(
  gateway: AuctionGateway = defaultAuctionGateway,
): Promise<AuctionListResponse> {
  return gateway.listFeaturedAuctions();
}

export async function getAuctionById(
  id: string,
  gateway: AuctionGateway = defaultAuctionGateway,
): Promise<AuctionApiItem | null> {
  return gateway.getAuctionById(id);
}

export async function listAuctionCategories(
  gateway: AuctionGateway = defaultAuctionGateway,
): Promise<AuctionApiCategory[]> {
  return gateway.listAuctionCategories();
}
