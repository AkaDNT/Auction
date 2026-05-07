import { Bid, BidStatus } from '@prisma/client';

export const BID_REPOSITORY = Symbol('BID_REPOSITORY');

export type PlacedBidResult = {
  id: string;
  bidderId: string;
  bidder: {
    slug: string;
  };
  amount: unknown;
  createdAt: Date;
};

export interface IBidRepository {
  findById(id: string): Promise<Bid | null>;

  findManyByAuction(
    auctionId: string,
    page: number,
    limit: number,
  ): Promise<any[]>;

  findLatest100ByAuctionOrderByAmountAsc(auctionId: string): Promise<Bid[]>;

  countByAuction(auctionId: string): Promise<number>;

  executePlaceBidTransaction(params: {
    auctionId: string;
    bidderId: string;
    amount: number;
  }): Promise<PlacedBidResult>;

  updateStatus(id: string, status: BidStatus): Promise<Bid>;
}
