export const AUCTION_LIFECYCLE_PRODUCER = Symbol('AUCTION_LIFECYCLE_PRODUCER');

export interface AuctionLifecycleProducer {
  scheduleEndAuction(params: { auctionId: string; endAt: Date }): Promise<void>;

  cancelEndAuction(auctionId: string): Promise<void>;
}
