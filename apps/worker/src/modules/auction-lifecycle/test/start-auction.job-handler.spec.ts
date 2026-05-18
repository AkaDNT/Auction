import { Test, type TestingModule } from '@nestjs/testing';
import { AUCTION_LIFECYCLE_START_JOB } from '@repo/shared';
import type { Job } from 'bullmq';

import { AuctionLifecycleService } from '../auction-lifecycle.service';
import { StartAuctionJobHandler } from '../handlers/start-auction.job-handler';

describe('StartAuctionJobHandler', () => {
  let handler: StartAuctionJobHandler;
  let auctionLifecycleService: jest.Mocked<
    Pick<AuctionLifecycleService, 'startAuction'>
  >;

  beforeEach(async () => {
    auctionLifecycleService = {
      startAuction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartAuctionJobHandler,
        {
          provide: AuctionLifecycleService,
          useValue: auctionLifecycleService,
        },
      ],
    }).compile();

    handler = module.get(StartAuctionJobHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes the start auction job name', () => {
    expect(handler.name).toBe(AUCTION_LIFECYCLE_START_JOB);
  });

  it('starts the auction from a valid job payload', async () => {
    const job = {
      id: 'job-1',
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(handler.handle(job)).resolves.toBeUndefined();

    expect(auctionLifecycleService.startAuction).toHaveBeenCalledWith(
      'auction-1',
    );
  });

  it('rejects an invalid job payload before calling the service', async () => {
    const job = {
      id: 'job-1',
      data: {
        version: 2,
        auctionId: 'auction-1',
      },
    } as unknown as Job;

    await expect(handler.handle(job)).rejects.toThrow(
      `Invalid job payload for ${AUCTION_LIFECYCLE_START_JOB}`,
    );

    expect(auctionLifecycleService.startAuction).not.toHaveBeenCalled();
  });

  it('bubbles service failures', async () => {
    const error = new Error('start failed');
    auctionLifecycleService.startAuction.mockRejectedValue(error);
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
