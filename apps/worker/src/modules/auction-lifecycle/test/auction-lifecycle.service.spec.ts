import { Test, type TestingModule } from '@nestjs/testing';

import {
  AUCTION_REPOSITORY,
  type IAuctionRepository,
} from '../../auction/auction.repository';
import { AuctionLifecycleService } from '../auction-lifecycle.service';
import {
  AUCTION_SETTLEMENT_TRANSACTION_REPOSITORY,
  type IAuctionSettlementTransactionRepository,
} from '../auction-settlement-transaction.repository';

describe('AuctionLifecycleService', () => {
  let service: AuctionLifecycleService;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionLifecycleService,
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

    service = module.get(AuctionLifecycleService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('marks an auction started when it is due', async () => {
    auctionRepository.markStartedIfDue.mockResolvedValue(true);

    await expect(service.startAuction('auction-1')).resolves.toBeUndefined();

    expect(auctionRepository.markStartedIfDue).toHaveBeenCalledWith(
      'auction-1',
      now,
    );
  });

  it('skips starting when the auction is not eligible', async () => {
    auctionRepository.markStartedIfDue.mockResolvedValue(false);

    await expect(service.startAuction('auction-1')).resolves.toBeUndefined();

    expect(auctionRepository.markStartedIfDue).toHaveBeenCalledWith(
      'auction-1',
      now,
    );
  });

  it('bubbles start auction repository failures', async () => {
    const error = new Error('database unavailable');
    auctionRepository.markStartedIfDue.mockRejectedValue(error);

    await expect(service.startAuction('auction-1')).rejects.toBe(error);
  });

  it('settles an auction when it is due', async () => {
    settlementRepository.settleAuctionIfDue.mockResolvedValue({
      settled: true,
    });

    await expect(service.endAuction('auction-1')).resolves.toBeUndefined();

    expect(settlementRepository.settleAuctionIfDue).toHaveBeenCalledWith({
      auctionId: 'auction-1',
      now,
    });
  });

  it('skips ending when settlement reports the auction is not eligible', async () => {
    settlementRepository.settleAuctionIfDue.mockResolvedValue({
      settled: false,
      reason: 'not-due',
    });

    await expect(service.endAuction('auction-1')).resolves.toBeUndefined();

    expect(settlementRepository.settleAuctionIfDue).toHaveBeenCalledWith({
      auctionId: 'auction-1',
      now,
    });
  });

  it('bubbles settlement repository failures', async () => {
    const error = new Error('settlement failed');
    settlementRepository.settleAuctionIfDue.mockRejectedValue(error);

    await expect(service.endAuction('auction-1')).rejects.toBe(error);
  });
});
