import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AUCTION_LIFECYCLE_QUEUE_NAME } from '@repo/shared';
import { AuctionLifecycleService } from './auction-lifecycle.service';
import { AUCTION_LIFECYCLE_PRODUCER } from './auction-lifecycle.producer';
import { BullAuctionLifecycleProducer } from './infrastructure/bull-auction-lifecycle.producer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: AUCTION_LIFECYCLE_QUEUE_NAME,
    }),
  ],
  providers: [
    BullAuctionLifecycleProducer,
    {
      provide: AUCTION_LIFECYCLE_PRODUCER,
      useExisting: BullAuctionLifecycleProducer,
    },
    AuctionLifecycleService,
  ],
  exports: [AuctionLifecycleService],
})
export class AuctionLifecycleModule {}
