import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  AUCTION_LIFECYCLE_END_JOB,
  AUCTION_LIFECYCLE_QUEUE_NAME,
  buildEndAuctionJobId,
  EndAuctionJobData,
} from '@repo/shared';
import { AuctionLifecycleProducer } from '../auction-lifecycle.producer';

@Injectable()
export class BullAuctionLifecycleProducer implements AuctionLifecycleProducer {
  private readonly logger = new Logger(BullAuctionLifecycleProducer.name);

  constructor(
    @InjectQueue(AUCTION_LIFECYCLE_QUEUE_NAME)
    private readonly queue: Queue<EndAuctionJobData>,
  ) {}

  async scheduleEndAuction(params: {
    auctionId: string;
    endAt: Date;
  }): Promise<void> {
    const { auctionId, endAt } = params;

    await this.cancelEndAuction(auctionId);

    const delay = Math.max(endAt.getTime() - Date.now(), 0);

    const payload: EndAuctionJobData = {
      version: 1,
      auctionId,
    };

    await this.queue.add(AUCTION_LIFECYCLE_END_JOB, payload, {
      jobId: buildEndAuctionJobId(auctionId),
      delay,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: false,
    });

    this.logger.log(
      `Scheduled auction end job: auctionId=${auctionId}, endAt=${endAt.toISOString()}`,
    );
  }

  async cancelEndAuction(auctionId: string): Promise<void> {
    const job = await this.queue.getJob(buildEndAuctionJobId(auctionId));

    if (!job) return;

    await job.remove();

    this.logger.log(`Cancelled auction end job: auctionId=${auctionId}`);
  }
}
