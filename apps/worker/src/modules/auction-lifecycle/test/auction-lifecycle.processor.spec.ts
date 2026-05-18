import {
  AUCTION_LIFECYCLE_END_JOB,
  AUCTION_LIFECYCLE_START_JOB,
} from '@repo/shared';
import type { Job } from 'bullmq';

import { AuctionLifecycleProcessor } from '../auction-lifecycle.processor';
import { EndAuctionJobHandler } from '../handlers/end-auction.job-handler';
import { StartAuctionJobHandler } from '../handlers/start-auction.job-handler';

describe('AuctionLifecycleProcessor', () => {
  let processor: AuctionLifecycleProcessor;
  let startAuctionJobHandler: jest.Mocked<
    Pick<StartAuctionJobHandler, 'handle'>
  > &
    Pick<StartAuctionJobHandler, 'name'>;
  let endAuctionJobHandler: jest.Mocked<Pick<EndAuctionJobHandler, 'handle'>> &
    Pick<EndAuctionJobHandler, 'name'>;

  beforeEach(() => {
    startAuctionJobHandler = {
      name: AUCTION_LIFECYCLE_START_JOB,
      handle: jest.fn(),
    };
    endAuctionJobHandler = {
      name: AUCTION_LIFECYCLE_END_JOB,
      handle: jest.fn(),
    };

    processor = new AuctionLifecycleProcessor(
      startAuctionJobHandler as StartAuctionJobHandler,
      endAuctionJobHandler as EndAuctionJobHandler,
    );
  });

  it('dispatches start auction jobs to the start handler', async () => {
    const job = {
      id: 'job-1',
      name: AUCTION_LIFECYCLE_START_JOB,
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(startAuctionJobHandler.handle).toHaveBeenCalledWith(job);
    expect(endAuctionJobHandler.handle).not.toHaveBeenCalled();
  });

  it('dispatches end auction jobs to the end handler', async () => {
    const job = {
      id: 'job-2',
      name: AUCTION_LIFECYCLE_END_JOB,
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(endAuctionJobHandler.handle).toHaveBeenCalledWith(job);
    expect(startAuctionJobHandler.handle).not.toHaveBeenCalled();
  });

  it('throws for unsupported auction lifecycle jobs', async () => {
    const job = {
      id: 'job-3',
      name: 'auction-lifecycle.unknown',
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).rejects.toThrow(
      'Unsupported auction lifecycle job: auction-lifecycle.unknown',
    );

    expect(startAuctionJobHandler.handle).not.toHaveBeenCalled();
    expect(endAuctionJobHandler.handle).not.toHaveBeenCalled();
  });

  it('bubbles handler failures', async () => {
    const error = new Error('handler failed');
    startAuctionJobHandler.handle.mockRejectedValue(error);
    const job = {
      id: 'job-4',
      name: AUCTION_LIFECYCLE_START_JOB,
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).rejects.toBe(error);
  });
});
