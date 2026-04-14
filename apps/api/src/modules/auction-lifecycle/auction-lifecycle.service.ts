import { Inject, Injectable } from '@nestjs/common';
import * as auctionLifecycleProducer from './auction-lifecycle.producer';

@Injectable()
export class AuctionLifecycleService {
  constructor(
    @Inject(auctionLifecycleProducer.AUCTION_LIFECYCLE_PRODUCER)
    private readonly producer: auctionLifecycleProducer.AuctionLifecycleProducer,
  ) {}

  async scheduleEndAuction(params: {
    auctionId: string;
    endAt: Date;
  }): Promise<void> {
    await this.producer.scheduleEndAuction(params);
  }

  async rescheduleEndAuction(params: {
    auctionId: string;
    endAt: Date;
  }): Promise<void> {
    await this.producer.scheduleEndAuction(params);
  }

  async cancelEndAuction(auctionId: string): Promise<void> {
    await this.producer.cancelEndAuction(auctionId);
  }

  async syncEndAuctionJob(params: {
    auctionId: string;
    endAt?: Date | null;
    shouldSchedule: boolean;
  }): Promise<void> {
    const { auctionId, endAt, shouldSchedule } = params;

    if (!shouldSchedule || !endAt) {
      await this.cancelEndAuction(auctionId);
      return;
    }

    await this.scheduleEndAuction({
      auctionId,
      endAt,
    });
  }
}
