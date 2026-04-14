import { Inject, Injectable, Logger } from '@nestjs/common';
import * as auctionRepository from '../auction/auction.repository';

@Injectable()
export class AuctionLifecycleService {
  private readonly logger = new Logger(AuctionLifecycleService.name);

  constructor(
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,
  ) {}

  async endAuction(auctionId: string): Promise<void> {
    const updated = await this.auctionRepo.markEndedIfDue(
      auctionId,
      new Date(),
    );

    if (!updated) {
      this.logger.debug(
        `Skip ending auction: auctionId=${auctionId}, reason=already-ended-or-not-due`,
      );
      return;
    }

    this.logger.log(`Auction ended successfully: auctionId=${auctionId}`);
  }
}
