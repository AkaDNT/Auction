import { Test, type TestingModule } from '@nestjs/testing';
import {
  AUCTION_LIFECYCLE_END_JOB,
  AUCTION_LIFECYCLE_START_JOB,
} from '@repo/shared';
import type { Job } from 'bullmq';
import {
  AUCTION_REPOSITORY,
  type IAuctionRepository,
} from '../src/modules/auction/auction.repository';
import { AuctionLifecycleProcessor } from '../src/modules/auction-lifecycle/auction-lifecycle.processor';
import { AuctionLifecycleService } from '../src/modules/auction-lifecycle/auction-lifecycle.service';
import {
  AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY,
  type IAuctionSettlementTransactionRepository,
} from '../src/modules/auction-lifecycle/auction-settlement-transaction.repository';
import { EndAuctionJobHandler } from '../src/modules/auction-lifecycle/handlers/end-auction.job-handler';
import { StartAuctionJobHandler } from '../src/modules/auction-lifecycle/handlers/start-auction.job-handler';

describe('AuctionLifecycle worker flow (e2e)', () => {
  let moduleRef: TestingModule;
  let processor: AuctionLifecycleProcessor;
  let auctionRepository: jest.Mocked<IAuctionRepository>;
  let settlementRepository: jest.Mocked<IAuctionSettlementTransactionRepository>;

  const nowMs = Date.parse('2026-05-18T10:00:00.000Z');
  const now = new Date(nowMs);

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(nowMs);

    auctionRepository = {
      markEndedIfDue: jest.fn(),
      markStartedIfDue: jest.fn(),
    };
    settlementRepository = {
      settleAuctionIfDue: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        AuctionLifecycleProcessor,
        AuctionLifecycleService,
        StartAuctionJobHandler,
        EndAuctionJobHandler,
        {
          provide: AUCTION_REPOSITORY,
          useValue: auctionRepository,
        },
        {
          provide: AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY,
          useValue: settlementRepository,
        },
      ],
    }).compile();

    processor = moduleRef.get(AuctionLifecycleProcessor);
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    await moduleRef.close();
  });

  it('processes a start job through processor, handler, service, and repository', async () => {
    auctionRepository.markStartedIfDue.mockResolvedValue(true);
    const job = {
      id: 'job-start-1',
      name: AUCTION_LIFECYCLE_START_JOB,
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(auctionRepository.markStartedIfDue).toHaveBeenCalledWith(
      'auction-1',
      now,
    );
    expect(settlementRepository.settleAuctionIfDue).not.toHaveBeenCalled();
  });

  it('processes an end job through processor, handler, service, and settlement repository', async () => {
    settlementRepository.settleAuctionIfDue.mockResolvedValue({
      settled: true,
    });
    const job = {
      id: 'job-end-1',
      name: AUCTION_LIFECYCLE_END_JOB,
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).resolves.toBeUndefined();

    expect(settlementRepository.settleAuctionIfDue).toHaveBeenCalledWith({
      auctionId: 'auction-1',
      now,
    });
    expect(auctionRepository.markStartedIfDue).not.toHaveBeenCalled();
  });

  it('rejects invalid job payloads before reaching repositories', async () => {
    const job = {
      id: 'job-start-invalid',
      name: AUCTION_LIFECYCLE_START_JOB,
      data: {
        version: 2,
        auctionId: 'auction-1',
      },
    } as unknown as Job;

    await expect(processor.process(job)).rejects.toThrow(
      `Invalid job payload for ${AUCTION_LIFECYCLE_START_JOB}`,
    );

    expect(auctionRepository.markStartedIfDue).not.toHaveBeenCalled();
    expect(settlementRepository.settleAuctionIfDue).not.toHaveBeenCalled();
  });

  it('rejects unsupported job names before reaching handlers or repositories', async () => {
    const job = {
      id: 'job-unknown',
      name: 'auction-lifecycle.unknown',
      data: {
        version: 1,
        auctionId: 'auction-1',
      },
    } as Job;

    await expect(processor.process(job)).rejects.toThrow(
      'Unsupported auction lifecycle job: auction-lifecycle.unknown',
    );

    expect(auctionRepository.markStartedIfDue).not.toHaveBeenCalled();
    expect(settlementRepository.settleAuctionIfDue).not.toHaveBeenCalled();
  });
});
