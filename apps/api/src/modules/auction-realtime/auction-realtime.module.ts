import { Module } from '@nestjs/common';
import { AuctionRealtimeGateway } from './auction-realtime.gateway';
import { AuctionRealtimeService } from './auction-realtime.service';
import { AUCTION_REALTIME_PUBLISHER } from './contracts/auction-realtime.publisher';

@Module({
  providers: [
    AuctionRealtimeGateway,
    AuctionRealtimeService,
    {
      provide: AUCTION_REALTIME_PUBLISHER,
      useExisting: AuctionRealtimeService,
    },
  ],
  exports: [AUCTION_REALTIME_PUBLISHER],
})
export class AuctionRealtimeModule {}
