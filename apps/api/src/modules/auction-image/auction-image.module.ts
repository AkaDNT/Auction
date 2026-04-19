import { Module } from '@nestjs/common';
import { AuctionImageController } from './auction-image.controller';
import { SellerAuctionImageController } from './seller-auction-image.controller';
import { AdminAuctionImageController } from './admin-auction-image.controller';
import { AuctionImageService } from './auction-image.service';
import { AuctionImagePrismaRepository } from './auction-image.prisma.repository';
import { AUCTION_IMAGE_REPOSITORY } from './auction-image.repository';
import { AuctionModule } from '../auction/auction.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuctionModule, StorageModule],
  controllers: [
    AuctionImageController,
    SellerAuctionImageController,
    AdminAuctionImageController,
  ],
  providers: [
    AuctionImageService,
    AuctionImagePrismaRepository,
    {
      provide: AUCTION_IMAGE_REPOSITORY,
      useExisting: AuctionImagePrismaRepository,
    },
  ],
})
export class AuctionImageModule {}
