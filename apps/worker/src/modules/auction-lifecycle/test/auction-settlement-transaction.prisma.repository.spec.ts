import {
  AuctionSettlementStatus,
  AuctionStatus,
  BidStatus,
  Prisma,
  WalletHoldStatus,
  WalletHoldType,
  WalletLedgerDirection,
  WalletLedgerType,
} from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';

import { AuctionSettlementTransactionPrismaRepository } from '../auction-settlement-transaction.prisma.repository';

describe('AuctionSettlementTransactionPrismaRepository', () => {
  let prisma: {
    $transaction: jest.Mock;
  };
  let repository: AuctionSettlementTransactionPrismaRepository;

  const now = new Date('2026-05-18T10:00:00.000Z');

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(),
    };
    repository = new AuctionSettlementTransactionPrismaRepository(
      prisma as never,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function runTransactionWith(tx: unknown) {
    prisma.$transaction.mockImplementation(
      (callback: (tx: unknown) => unknown) => callback(tx),
    );
  }

  function liveDueAuction(overrides: Record<string, unknown> = {}) {
    return {
      id: 'auction-1',
      status: AuctionStatus.LIVE,
      endAt: new Date('2026-05-18T09:59:00.000Z'),
      ...overrides,
    };
  }

  function winningBid(overrides: Record<string, unknown> = {}) {
    return {
      id: 'bid-1',
      auctionId: 'auction-1',
      bidderId: 'winner-1',
      amount: new Prisma.Decimal('75000'),
      status: BidStatus.WINNING,
      createdAt: new Date('2026-05-18T09:00:00.000Z'),
      ...overrides,
    };
  }

  function createWinningSettlementTx(overrides: Record<string, unknown> = {}) {
    const bid = winningBid();
    const winnerWallet = {
      id: 'wallet-winner',
      userId: 'winner-1',
      balance: new Prisma.Decimal('100000'),
      lockedBalance: new Prisma.Decimal('75000'),
    };
    const updatedWallet = {
      ...winnerWallet,
      balance: new Prisma.Decimal('25000'),
      lockedBalance: new Prisma.Decimal('0'),
    };
    const winnerHold = {
      id: 'hold-winner',
      walletId: 'wallet-winner',
      userId: 'winner-1',
      amount: new Prisma.Decimal('75000'),
      status: WalletHoldStatus.ACTIVE,
    };
    const settlement = {
      id: 'settlement-1',
      auctionId: 'auction-1',
      winnerUserId: 'winner-1',
      winningBidId: 'bid-1',
      finalAmount: new Prisma.Decimal('75000'),
      status: AuctionSettlementStatus.COMPLETED,
    };

    return {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue(liveDueAuction()),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      bid: {
        findMany: jest.fn().mockResolvedValue([bid]),
        updateMany: jest
          .fn()
          .mockResolvedValueOnce({ count: 1 })
          .mockResolvedValueOnce({ count: 2 }),
      },
      wallet: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce(winnerWallet)
          .mockResolvedValueOnce(updatedWallet),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      walletHold: {
        findFirst: jest.fn().mockResolvedValue(winnerHold),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'hold-loser-1',
            walletId: 'wallet-loser',
            amount: new Prisma.Decimal('30000'),
          },
          {
            id: 'hold-loser-2',
            walletId: 'wallet-loser',
            amount: new Prisma.Decimal('20000'),
          },
        ]),
        updateMany: jest
          .fn()
          .mockResolvedValueOnce({ count: 1 })
          .mockResolvedValueOnce({ count: 2 }),
      },
      walletLedgerEntry: {
        create: jest.fn(),
      },
      auctionSettlement: {
        upsert: jest.fn().mockResolvedValue(settlement),
      },
      ...overrides,
    };
  }

  it('throws the auction not found error when the auction does not exist', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'missing-auction',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUCTION_NOT_FOUND,
      details: { auctionId: 'missing-auction' },
    });

    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.auction.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-auction' },
    });
  });

  it('returns not-due when a live auction has not reached end time', async () => {
    const endAt = new Date('2026-05-18T10:01:00.000Z');
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.LIVE,
          endAt,
        }),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: false,
      reason: 'not-due',
    });
  });

  it('returns an already-ended reason with an existing settlement', async () => {
    const settlement = {
      id: 'settlement-1',
      auctionId: 'auction-1',
    };
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.ENDED,
        }),
      },
      auctionSettlement: {
        findUnique: jest.fn().mockResolvedValue(settlement),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: false,
      reason: 'already-ended',
      settlement,
    });
  });

  it('returns an already-ended-without-settlement reason when ended data is incomplete', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.ENDED,
        }),
      },
      auctionSettlement: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: false,
      reason: 'already-ended-without-settlement',
      settlement: undefined,
    });
  });

  it('returns an invalid status reason for auctions that are not live or ended', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.CANCELLED,
        }),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: false,
      reason: `invalid-status-${AuctionStatus.CANCELLED}`,
    });
  });

  it('ends an auction without a winner and creates a completed settlement', async () => {
    const settlement = {
      id: 'settlement-1',
      auctionId: 'auction-1',
      status: AuctionSettlementStatus.COMPLETED,
    };
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.LIVE,
          endAt: new Date('2026-05-18T09:59:00.000Z'),
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      bid: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn().mockResolvedValue({ count: 3 }),
      },
      walletHold: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      auctionSettlement: {
        upsert: jest.fn().mockResolvedValue(settlement),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: true,
      settlement,
    });

    expect(tx.bid.findMany).toHaveBeenCalledWith({
      where: {
        auctionId: 'auction-1',
        status: BidStatus.WINNING,
      },
      orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
      take: 2,
    });
    expect(tx.bid.updateMany).toHaveBeenCalledWith({
      where: {
        auctionId: 'auction-1',
        status: {
          in: [BidStatus.VALID, BidStatus.OUTBID, BidStatus.WINNING],
        },
      },
      data: {
        status: BidStatus.LOST,
      },
    });
    expect(tx.auction.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'auction-1',
        status: AuctionStatus.LIVE,
      },
      data: {
        status: AuctionStatus.ENDED,
      },
    });
    expect(tx.auctionSettlement.upsert).toHaveBeenCalledWith({
      where: { auctionId: 'auction-1' },
      update: {
        winnerUserId: null,
        winningBidId: null,
        finalAmount: null,
        status: AuctionSettlementStatus.COMPLETED,
        processedAt: now,
        failureReason: null,
      },
      create: {
        auction: {
          connect: { id: 'auction-1' },
        },
        status: AuctionSettlementStatus.COMPLETED,
        processedAt: now,
      },
    });
  });

  it('throws when more than one winning bid exists', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue(liveDueAuction()),
      },
      bid: {
        findMany: jest
          .fn()
          .mockResolvedValue([winningBid(), winningBid({ id: 'bid-2' })]),
      },
    };
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUCTION_INVALID_STATUS,
      details: {
        auctionId: 'auction-1',
        winningBidIds: ['bid-1', 'bid-2'],
      },
    });
  });

  it('captures the winning hold, debits the winner wallet, releases remaining holds, and creates a settlement', async () => {
    const tx = createWinningSettlementTx();
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toMatchObject({
      settled: true,
      settlement: {
        id: 'settlement-1',
        auctionId: 'auction-1',
        winnerUserId: 'winner-1',
        winningBidId: 'bid-1',
      },
    });

    expect(tx.walletHold.findFirst).toHaveBeenCalledWith({
      where: {
        walletId: 'wallet-winner',
        userId: 'winner-1',
        type: WalletHoldType.BID,
        status: WalletHoldStatus.ACTIVE,
        referenceType: 'AUCTION',
        referenceId: 'auction-1',
        amount: new Prisma.Decimal('75000'),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    expect(tx.wallet.updateMany).toHaveBeenNthCalledWith(1, {
      where: {
        id: 'wallet-winner',
        balance: {
          gte: new Prisma.Decimal('75000'),
        },
        lockedBalance: {
          gte: new Prisma.Decimal('75000'),
        },
      },
      data: {
        balance: {
          decrement: new Prisma.Decimal('75000'),
        },
        lockedBalance: {
          decrement: new Prisma.Decimal('75000'),
        },
      },
    });
    expect(tx.wallet.updateMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: 'wallet-loser',
        lockedBalance: {
          gte: new Prisma.Decimal('50000'),
        },
      },
      data: {
        lockedBalance: {
          decrement: new Prisma.Decimal('50000'),
        },
      },
    });
    expect(tx.walletLedgerEntry.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        direction: WalletLedgerDirection.DEBIT,
        type: WalletLedgerType.BID_HOLD_CAPTURED,
        amount: new Prisma.Decimal('75000'),
        balanceAfter: new Prisma.Decimal('25000'),
        lockedAfter: new Prisma.Decimal('0'),
        referenceType: 'AUCTION',
        referenceId: 'auction-1',
        idempotencyKey: 'AUCTION_CAPTURE_auction-1',
      }),
    });
  });

  it('throws when the winning bidder has no wallet', async () => {
    const tx = createWinningSettlementTx({
      wallet: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_NOT_FOUND,
      details: {
        auctionId: 'auction-1',
        winnerUserId: 'winner-1',
      },
    });
  });

  it('throws when the winning bidder has no active matching hold', async () => {
    const tx = createWinningSettlementTx({
      walletHold: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
      details: {
        auctionId: 'auction-1',
        winningBidId: 'bid-1',
        winnerUserId: 'winner-1',
        finalAmount: '75000',
      },
    });
  });

  it('throws when the winning hold amount does not match the winning bid', async () => {
    const tx = createWinningSettlementTx({
      walletHold: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'hold-winner',
          walletId: 'wallet-winner',
          userId: 'winner-1',
          amount: new Prisma.Decimal('70000'),
          status: WalletHoldStatus.ACTIVE,
        }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INVALID_STATE,
      details: {
        holdAmount: '70000',
        finalAmount: '75000',
      },
    });
  });

  it('throws when the winning hold is no longer active during capture', async () => {
    const tx = createWinningSettlementTx({
      walletHold: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'hold-winner',
          walletId: 'wallet-winner',
          userId: 'winner-1',
          amount: new Prisma.Decimal('75000'),
          status: WalletHoldStatus.ACTIVE,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INVALID_STATE,
      details: {
        auctionId: 'auction-1',
        winningBidId: 'bid-1',
        holdId: 'hold-winner',
      },
    });
  });

  it('throws when the winner wallet cannot cover the captured amount', async () => {
    const tx = createWinningSettlementTx({
      wallet: {
        findUnique: jest.fn().mockResolvedValueOnce({
          id: 'wallet-winner',
          userId: 'winner-1',
          balance: new Prisma.Decimal('10000'),
          lockedBalance: new Prisma.Decimal('10000'),
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INVALID_STATE,
      details: {
        walletId: 'wallet-winner',
        finalAmount: '75000',
      },
    });
  });

  it('throws when the winner wallet disappears after debit', async () => {
    const tx = createWinningSettlementTx({
      wallet: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'wallet-winner',
            userId: 'winner-1',
            balance: new Prisma.Decimal('100000'),
            lockedBalance: new Prisma.Decimal('75000'),
          })
          .mockResolvedValueOnce(null),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_NOT_FOUND,
      details: {
        walletId: 'wallet-winner',
        auctionId: 'auction-1',
      },
    });
  });

  it('throws when the winning bid is no longer winning during update', async () => {
    const tx = createWinningSettlementTx({
      bid: {
        findMany: jest.fn().mockResolvedValue([winningBid()]),
        updateMany: jest.fn().mockResolvedValueOnce({ count: 0 }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUCTION_INVALID_STATUS,
      details: {
        auctionId: 'auction-1',
        winningBidId: 'bid-1',
      },
    });
  });

  it('throws when releasing remaining holds would make a wallet invalid', async () => {
    const tx = createWinningSettlementTx({
      wallet: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'wallet-winner',
            userId: 'winner-1',
            balance: new Prisma.Decimal('100000'),
            lockedBalance: new Prisma.Decimal('75000'),
          })
          .mockResolvedValueOnce({
            id: 'wallet-winner',
            userId: 'winner-1',
            balance: new Prisma.Decimal('25000'),
            lockedBalance: new Prisma.Decimal('0'),
          }),
        updateMany: jest
          .fn()
          .mockResolvedValueOnce({ count: 1 })
          .mockResolvedValueOnce({ count: 0 }),
      },
    });
    runTransactionWith(tx);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INVALID_STATE,
      details: {
        walletId: 'wallet-loser',
        auctionId: 'auction-1',
        releaseAmount: '50000',
      },
    });
  });

  it('retries serializable transaction conflicts before returning the settlement result', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.ENDED,
        }),
      },
      auctionSettlement: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'settlement-1',
          auctionId: 'auction-1',
        }),
      },
    };

    prisma.$transaction
      .mockRejectedValueOnce({ code: 'P2034' })
      .mockImplementationOnce((callback: (tx: unknown) => unknown) =>
        callback(tx),
      );

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).resolves.toEqual({
      settled: false,
      reason: 'already-ended',
      settlement: {
        id: 'settlement-1',
        auctionId: 'auction-1',
      },
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('throws the last serializable conflict after exhausting retries', async () => {
    const error = { code: 'P2034' };
    prisma.$transaction.mockRejectedValue(error);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toBe(error);

    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry non-serializable transaction errors', async () => {
    const error = new Error('connection closed');
    prisma.$transaction.mockRejectedValue(error);

    await expect(
      repository.settleAuctionIfDue({
        auctionId: 'auction-1',
        now,
      }),
    ).rejects.toBe(error);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('uses a serializable transaction with bounded wait and timeout', async () => {
    const tx = {
      $queryRaw: jest.fn(),
      auction: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'auction-1',
          status: AuctionStatus.LIVE,
          endAt: new Date('2026-05-18T10:01:00.000Z'),
        }),
      },
    };
    runTransactionWith(tx);

    await repository.settleAuctionIfDue({
      auctionId: 'auction-1',
      now,
    });

    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5_000,
      timeout: 15_000,
    });
  });
});
