import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  AUCTION_LIFECYCLE_END_JOB,
  AUCTION_LIFECYCLE_QUEUE_NAME,
  EndAuctionJobData,
  isEndAuctionJobData,
} from '@repo/shared';
import { JobHandler } from 'src/common/queue/job-handler.port';
import { AuctionLifecycleService } from './auction-lifecycle.service';

@Injectable()
@Processor(AUCTION_LIFECYCLE_QUEUE_NAME)
export class AuctionLifecycleHandler
  extends WorkerHost
  implements JobHandler<EndAuctionJobData, void>
{
  readonly name = AUCTION_LIFECYCLE_END_JOB;
  private readonly logger = new Logger(AuctionLifecycleHandler.name);

  constructor(
    private readonly auctionLifecycleService: AuctionLifecycleService,
  ) {
    super();
  }

  async process(job: Job<EndAuctionJobData>): Promise<void> {
    if (job.name !== this.name) {
      this.logger.warn(`Ignored unsupported job: ${job.name}`);
      return;
    }

    await this.handle(job);
  }

  async handle(job: Job<EndAuctionJobData>): Promise<void> {
    if (!isEndAuctionJobData(job.data)) {
      throw new Error(`Invalid job payload for ${this.name}`);
    }

    this.logger.debug(
      `Handling job: name=${job.name}, id=${job.id}, auctionId=${job.data.auctionId}`,
    );

    await this.auctionLifecycleService.endAuction(job.data.auctionId);
  }
}
