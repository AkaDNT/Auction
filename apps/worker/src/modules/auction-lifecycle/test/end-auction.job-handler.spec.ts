import { Test, type TestingModule } from '@nestjs/testing';
import { AUCTION_LIFECYCLE_END_JOB } from '@repo/shared';
import type { Job } from 'bullmq';

import { AuctionLifecycleService } from '../auction-lifecycle.service';
import { EndAuctionJobHandler } from '../handlers/end-auction.job-handler';

describe('EndAuctionJobHandler', () => {
  let handler: EndAuctionJobHandler;
  let auctionLifecycleService: jest.Mocked<
    Pick<AuctionLifecycleService, 'endAuction'>
  >;

  beforeEach(async () => {
    auctionLifecycleService = {
      endAuction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EndAuctionJobHandler,
        {
          provide: AuctionLifecycleService,
          useValue: auctionLifecycleService,
        },
      ],
    }).compile();

    handler = module.get(EndAuctionJobHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes the end auction job name', () => {
    expect(handler.name).toBe(AUCTION_LIFECYCLE_END_JOB);
  });

  it('ends the auction from a valid job payload', async () => {
    const job = {
      id: 'job-1',
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(handler.handle(job)).resolves.toBeUndefined();

    expect(auctionLifecycleService.endAuction).toHaveBeenCalledWith(
      'auction-1',
    );
  });

  it('rejects an invalid job payload before calling the service', async () => {
    const job = {
      id: 'job-1',
      data: {
        auctionId: 'auction-1',
      },
    } as unknown as Job;

    await expect(handler.handle(job)).rejects.toThrow(
      `Invalid job payload for ${AUCTION_LIFECYCLE_END_JOB}`,
    );

    expect(auctionLifecycleService.endAuction).not.toHaveBeenCalled();
  });

  it('bubbles service failures', async () => {
    const error = new Error('settlement failed');
    auctionLifecycleService.endAuction.mockRejectedValue(error);
    const job = {
      id: 'job-1',
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(handler.handle(job)).rejects.toBe(error);
  });
});
