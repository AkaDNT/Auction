import { Module } from '@nestjs/common';
import { AuctionPrismaRepository } from './auction.prisma.repository';
import { AUCTION_REPOSITORY } from './auction.repository';

@Module({
  imports: [],
  providers: [
    AuctionPrismaRepository,
    {
      provide: AUCTION_REPOSITORY,
      useExisting: AuctionPrismaRepository,
    },
  ],
  exports: [AUCTION_REPOSITORY],
})
export class AuctionModule {}
