import { Bid, BidStatus } from '@prisma/client';

export const BID_REPOSITORY = Symbol('BID_REPOSITORY');

export interface IBidRepository {
  findById(id: string): Promise<Bid | null>;

  findManyByAuction(
    auctionId: string,
    page: number,
    limit: number,
  ): Promise<any[]>;

  countByAuction(auctionId: string): Promise<number>;

  executePlaceBidTransaction(params: {
    auctionId: string;
    bidderId: string;
    amount: number;
  }): Promise<void>;

  updateStatus(id: string, status: BidStatus): Promise<Bid>;
}
