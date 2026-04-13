import { Injectable } from '@nestjs/common';
import { AuctionRealtimeGateway } from './auction-realtime.gateway';
import { AuctionRealtimePublisher } from './contracts/auction-realtime.publisher';

@Injectable()
export class AuctionRealtimeService implements AuctionRealtimePublisher {
  constructor(private readonly gateway: AuctionRealtimeGateway) {}

  async publishBidPlaced(event: {
    auctionId: string;
    bidderId: string;
    amount: number;
    placedAt: Date;
  }): Promise<void> {
    this.gateway.emitBidPlaced({
      auctionId: event.auctionId,
      bidderId: event.bidderId,
      amount: event.amount,
      placedAt: event.placedAt.toISOString(),
    });
  }
}
