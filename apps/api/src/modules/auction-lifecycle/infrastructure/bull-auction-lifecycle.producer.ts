import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  AUCTION_LIFECYCLE_END_JOB,
  AUCTION_LIFECYCLE_QUEUE_NAME,
  AUCTION_LIFECYCLE_START_JOB,
  AuctionLifeCycleJobData,
  buildEndAuctionJobId,
  buildStartAuctionJobId,
  EndAuctionJobData,
  StartAuctionJobData,
} from '@repo/shared';
import { Queue } from 'bullmq';

import { AuctionLifecycleProducer } from '../auction-lifecycle.producer';

@Injectable()
export class BullAuctionLifecycleProducer implements AuctionLifecycleProducer {
  private readonly logger = new Logger(BullAuctionLifecycleProducer.name);

  constructor(
    @InjectQueue(AUCTION_LIFECYCLE_QUEUE_NAME)
    private readonly queue: Queue<AuctionLifeCycleJobData>,
  ) {}
  async scheduleStartAuction(params: {
    auctionId: string;
    startAt: Date;
  }): Promise<void> {
    const { auctionId, startAt } = params;
    await this.cancelStartAuction(auctionId);

    const delay = Math.max(startAt.getTime() - Date.now(), 0);

    const payload: StartAuctionJobData = {
      version: 1,
      auctionId,
    };

    await this.queue.add(AUCTION_LIFECYCLE_START_JOB, payload, {
      jobId: buildStartAuctionJobId(auctionId),
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
      `Scheduled auction start job: auctionId=${auctionId}, startAt=${startAt.toISOString()}`,
    );
  }
  async cancelStartAuction(auctionId: string): Promise<void> {
    const jobId = buildStartAuctionJobId(auctionId);
    const job = await this.queue.getJob(jobId);
    if (!job) return;
    await job.remove();
    this.logger.log(`Cancelled auction start job: auctionId=${auctionId}`);
  }

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
