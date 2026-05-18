import { Inject, Injectable, Logger } from '@nestjs/common';
import * as auctionRepository from '../auction/auction.repository';
import * as auctionSettlementTransactionRepository from './auction-settlement-transaction.repository';

@Injectable()
export class AuctionLifecycleService {
  private readonly logger = new Logger(AuctionLifecycleService.name);

  constructor(
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,

    @Inject(
      auctionSettlementTransactionRepository.AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY,
    )
    private readonly auctionSettlementTransactionRepo: auctionSettlementTransactionRepository.IAuctionSettlementTransactionRepository,
  ) {}

  async endAuction(auctionId: string): Promise<void> {
    const result =
      await this.auctionSettlementTransactionRepo.settleAuctionIfDue({
        auctionId,
        now: new Date(),
      });

    if (!result.settled) {
      this.logger.debug(
        `Skip ending auction: auctionId=${auctionId}, reason=${result.reason}`,
      );
      return;
    }

    this.logger.log(`Auction settled successfully: auctionId=${auctionId}`);
  }

  async startAuction(auctionId: string): Promise<void> {
    const updated = await this.auctionRepo.markStartedIfDue(
      auctionId,
      new Date(),
    );

    if (!updated) {
      this.logger.debug(
        `Skip starting auction: auctionId=${auctionId}, reason=already-started-cancelled-ended-or-not-due`,
      );
      return;
    }

    this.logger.log(`Auction started successfully: auctionId=${auctionId}`);
  }
}
