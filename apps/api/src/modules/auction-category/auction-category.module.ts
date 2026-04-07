import { Module } from '@nestjs/common';
import { AuctionCategoryController } from './auction-category.controller';
import { AuctionCategoryService } from './auction-category.service';
import { AuctionCategoryPrismaRepository } from './auction-category.prisma.repository';
import { AUCTION_CATEGORY_REPOSITORY } from './auction-category.repository';
import { AdminAuctionCategoryController } from './admin-auction-category.controller';

@Module({
  controllers: [AuctionCategoryController, AdminAuctionCategoryController],
  providers: [
    AuctionCategoryService,
    AuctionCategoryPrismaRepository,
    {
      provide: AUCTION_CATEGORY_REPOSITORY,
      useExisting: AuctionCategoryPrismaRepository,
    },
  ],
  exports: [AuctionCategoryService, AUCTION_CATEGORY_REPOSITORY],
})
export class AuctionCategoryModule {}
