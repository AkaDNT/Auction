import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AUCTION_LIFECYCLE_QUEUE_NAME } from '@repo/shared';
import { PrismaModule } from 'src/prisma/prisma.module';
import * as auctionRepository from '../auction/auction.repository';
import { AuctionPrismaRepository } from '../auction/auction.prisma.repository';
import { AuctionLifecycleHandler } from './auction-lifecycle.handler';
import { AuctionLifecycleService } from './auction-lifecycle.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: AUCTION_LIFECYCLE_QUEUE_NAME,
    }),
  ],
  providers: [
    AuctionPrismaRepository,
    {
      provide: auctionRepository.AUCTION_REPOSITORY,
      useExisting: AuctionPrismaRepository,
    },
    AuctionLifecycleService,
    AuctionLifecycleHandler,
  ],
})
export class AuctionLifecycleModule {}
