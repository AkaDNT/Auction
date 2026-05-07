import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  AUCTION_LIFECYCLE_QUEUE_NAME,
  AuctionLifeCycleJobData,
} from '@repo/shared';
import { JobHandler } from 'src/common/queue/job-handler.port';
import { StartAuctionJobHandler } from './handlers/start-auction.job-handler';
import { EndAuctionJobHandler } from './handlers/end-auction.job-handler';

@Injectable()
@Processor(AUCTION_LIFECYCLE_QUEUE_NAME)
export class AuctionLifecycleProcessor extends WorkerHost {
  private readonly logger = new Logger(AuctionLifecycleProcessor.name);

  private readonly handlers: Map<string, JobHandler>;

  constructor(
    startAuctionJobHandler: StartAuctionJobHandler,
    endAuctionJobHandler: EndAuctionJobHandler,
  ) {
    super();

    this.handlers = new Map<string, JobHandler>([
      [startAuctionJobHandler.name, startAuctionJobHandler],
      [endAuctionJobHandler.name, endAuctionJobHandler],
    ]);
  }

  async process(job: Job<AuctionLifeCycleJobData>): Promise<void> {
    const handler = this.handlers.get(job.name);

    if (!handler) {
      throw new Error(`Unsupported auction lifecycle job: ${job.name}`);
    }

    this.logger.debug(
      `Dispatching auction lifecycle job: name=${job.name}, id=${job.id}`,
    );

    await handler.handle(job);
  }
}
