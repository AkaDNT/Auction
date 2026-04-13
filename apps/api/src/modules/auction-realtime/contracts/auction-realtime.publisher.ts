export const AUCTION_REALTIME_PUBLISHER = Symbol('AUCTION_REALTIME_PUBLISHER');

export interface AuctionRealtimePublisher {
  publishBidPlaced(event: {
    auctionId: string;
    bidderId: string;
    amount: number;
    placedAt: Date;
  }): Promise<void>;
}
