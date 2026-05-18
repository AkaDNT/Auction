import { AuctionSettlement } from '@prisma/client';

export const AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY = Symbol(
  'AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY',
);

export type SettleAuctionIfDueParams = {
  auctionId: string;
  now: Date;
};

export type SettleAuctionIfDueResult = {
  settled: boolean;
  reason?: string;
  settlement?: AuctionSettlement;
};

export interface IAuctionSettlementTransactionRepository {
  settleAuctionIfDue(
    params: SettleAuctionIfDueParams,
  ): Promise<SettleAuctionIfDueResult>;
}
