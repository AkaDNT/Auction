export const AUCTION_REPOSITORY = Symbol('AUCTION_REPOSITORY');

export interface IAuctionRepository {
  markEndedIfDue(auctionId: string, now: Date): Promise<boolean>;
}
