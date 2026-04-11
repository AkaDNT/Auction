import { Module } from '@nestjs/common';
import { AuctionContentController } from './auction-content.controller';
import { AdminAuctionContentController } from './admin-auction-content.controller';
import { AuctionContentService } from './auction-content.service';
import { AuctionContentPrismaRepository } from './auction-content.prisma.repository';
import { AUCTION_CONTENT_REPOSITORY } from './auction-content.repository';

@Module({
  controllers: [AuctionContentController, AdminAuctionContentController],
  providers: [
    AuctionContentService,
    AuctionContentPrismaRepository,
    {
      provide: AUCTION_CONTENT_REPOSITORY,
      useExisting: AuctionContentPrismaRepository,
    },
  ],
})
export class AuctionContentModule {}
