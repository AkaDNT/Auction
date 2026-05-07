import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  AUCTION_LIFECYCLE_END_JOB,
  EndAuctionJobData,
  isEndAuctionJobData,
} from '@repo/shared';
import { JobHandler } from 'src/common/queue/job-handler.port';
import { AuctionLifecycleService } from '../auction-lifecycle.service';

@Injectable()
export class EndAuctionJobHandler implements JobHandler<
  EndAuctionJobData,
  void
> {
  readonly name = AUCTION_LIFECYCLE_END_JOB;

  private readonly logger = new Logger(EndAuctionJobHandler.name);

  constructor(
    private readonly auctionLifecycleService: AuctionLifecycleService,
  ) {}

  async handle(job: Job<EndAuctionJobData>): Promise<void> {
    if (!isEndAuctionJobData(job.data)) {
      throw new Error(`Invalid job payload for ${this.name}`);
    }

    this.logger.debug(
      `Handling end auction job: id=${job.id}, auctionId=${job.data.auctionId}`,
    );

    await this.auctionLifecycleService.endAuction(job.data.auctionId);
  }
}
