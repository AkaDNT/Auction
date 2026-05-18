import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { UserBidController } from './user-bid.controller';
import { AdminBidController } from './admin-bid.controller';
import { BidService } from './bid.service';
import { BidPrismaRepository } from './bid.prisma.repository';
import { BID_REPOSITORY } from './bid.repository';
import { AuctionModule } from '../auction/auction.module';
import { AuctionRealtimeModule } from '../auction-realtime/auction-realtime.module';
import { BID_TRANSACTION_REPOSITORY } from './bid-transaction.repository';
import { BidTransactionPrismaRepository } from './bid-transaction.prisma.repository';

@Module({
  imports: [AuctionModule, AuctionRealtimeModule],
  controllers: [BidController, UserBidController, AdminBidController],
  providers: [
    BidService,
    BidPrismaRepository,
    BidTransactionPrismaRepository,
    {
      provide: BID_REPOSITORY,
      useExisting: BidPrismaRepository,
    },
    {
      provide: BID_TRANSACTION_REPOSITORY,
      useExisting: BidTransactionPrismaRepository,
    },
  ],
})
export class BidModule {}
