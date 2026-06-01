import { Module } from '@nestjs/common';

import { AuctionCategoryModule } from '../auction-category/auction-category.module';
import { AuctionLifecycleModule } from '../auction-lifecycle/auction-lifecycle.module';
import { UploadAssetModule } from '../upload-asset/upload-asset.module';

import { AdminAuctionController } from './admin-auction.controller';
import { AuctionController } from './auction.controller';
import { AuctionPrismaRepository } from './auction.prisma.repository';
import { AUCTION_REPOSITORY } from './auction.repository';
import { AuctionService } from './auction.service';
import { AuctionCacheService } from './auction-cache.service';
import { SellerAuctionController } from './seller-auction.controller';

@Module({
  imports: [AuctionCategoryModule, AuctionLifecycleModule, UploadAssetModule],
  controllers: [
    AuctionController,
    SellerAuctionController,
    AdminAuctionController,
  ],
  providers: [
    AuctionService,
    AuctionCacheService,
    AuctionPrismaRepository,
    {
      provide: AUCTION_REPOSITORY,
      useExisting: AuctionPrismaRepository,
    },
  ],
  exports: [AuctionService, AUCTION_REPOSITORY],
})
export class AuctionModule {}
