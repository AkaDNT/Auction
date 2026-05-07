import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AUCTION_LIFECYCLE_QUEUE_NAME } from '@repo/shared';
import { AuctionLifecycleProcessor } from './auction-lifecycle.processor';
import { AuctionLifecycleService } from './auction-lifecycle.service';
import { StartAuctionJobHandler } from './handlers/start-auction.job-handler';
import { EndAuctionJobHandler } from './handlers/end-auction.job-handler';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [
    AuctionModule,
    BullModule.registerQueue({
      name: AUCTION_LIFECYCLE_QUEUE_NAME,
    }),
  ],
  providers: [
    AuctionLifecycleService,
    AuctionLifecycleProcessor,
    StartAuctionJobHandler,
    EndAuctionJobHandler,
  ],
  exports: [AuctionLifecycleService],
})
export class AuctionLifecycleModule {}
