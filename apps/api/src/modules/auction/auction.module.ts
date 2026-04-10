import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { SellerAuctionController } from './seller-auction.controller';
import { AdminAuctionController } from './admin-auction.controller';
import { AuctionService } from './auction.service';
import { AuctionPrismaRepository } from './auction.prisma.repository';
import { AUCTION_REPOSITORY } from './auction.repository';
import { AuctionCategoryModule } from '../auction-category/auction-category.module';

@Module({
  imports: [AuctionCategoryModule],
  controllers: [
    AuctionController,
    SellerAuctionController,
    AdminAuctionController,
  ],
  providers: [
    AuctionService,
    AuctionPrismaRepository,
    {
      provide: AUCTION_REPOSITORY,
      useExisting: AuctionPrismaRepository,
    },
  ],
  exports: [AuctionService, AUCTION_REPOSITORY],
})
export class AuctionModule {}
