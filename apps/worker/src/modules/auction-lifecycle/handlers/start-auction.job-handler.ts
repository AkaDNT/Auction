import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  AUCTION_LIFECYCLE_START_JOB,
  isStartAuctionJobData,
  StartAuctionJobData,
} from '@repo/shared';
import { JobHandler } from 'src/common/queue/job-handler.port';
import { AuctionLifecycleService } from '../auction-lifecycle.service';

@Injectable()
export class StartAuctionJobHandler implements JobHandler<
  StartAuctionJobData,
  void
> {
  readonly name = AUCTION_LIFECYCLE_START_JOB;

  private readonly logger = new Logger(StartAuctionJobHandler.name);

  constructor(
    private readonly auctionLifecycleService: AuctionLifecycleService,
  ) {}

  async handle(job: Job<StartAuctionJobData>): Promise<void> {
    if (!isStartAuctionJobData(job.data)) {
      throw new Error(`Invalid job payload for ${this.name}`);
    }

    this.logger.debug(
      `Handling start auction job: id=${job.id}, auctionId=${job.data.auctionId}`,
    );

    await this.auctionLifecycleService.startAuction(job.data.auctionId);
  }
}
