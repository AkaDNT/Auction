import { Bid } from '@prisma/client';

export const BID_TRANSACTION_REPOSITORY = Symbol('BID_TRANSACTION_REPOSITORY');

export type PlaceBidParams = {
  auctionId: string;
  bidderId: string;
  amount: number;
};

export interface IBidTransactionRepository {
  placeBid(params: PlaceBidParams): Promise<Bid>;
}
