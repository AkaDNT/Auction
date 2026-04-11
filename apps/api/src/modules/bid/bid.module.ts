import { Module } from '@nestjs/common';
import { BidController } from './bid.controller';
import { UserBidController } from './user-bid.controller';
import { AdminBidController } from './admin-bid.controller';
import { BidService } from './bid.service';
import { BidPrismaRepository } from './bid.prisma.repository';
import { BID_REPOSITORY } from './bid.repository';
import { AuctionModule } from '../auction/auction.module';

@Module({
  imports: [AuctionModule],
  controllers: [BidController, UserBidController, AdminBidController],
  providers: [
    BidService,
    BidPrismaRepository,
    {
      provide: BID_REPOSITORY,
      useExisting: BidPrismaRepository,
    },
  ],
})
export class BidModule {}
