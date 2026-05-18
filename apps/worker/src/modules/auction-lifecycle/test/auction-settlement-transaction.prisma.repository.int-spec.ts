import {
  AuctionSettlementStatus,
  AuctionStatus,
  BidStatus,
  WalletHoldStatus,
  WalletLedgerDirection,
  WalletLedgerType,
} from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

import { AuctionSettlementTransactionPrismaRepository } from '../auction-settlement-transaction.prisma.repository';

import {
  cleanAuctionLifecycleTestDatabase,
  createActiveBidHold,
  createTestAuction,
  createTestAuctionCategory,
  createTestBid,
  createTestUser,
  createTestWallet,
  expectDecimal,
} from './auction-lifecycle-test.helpers';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration(
  'AuctionSettlementTransactionPrismaRepository integration',
  () => {
    let prisma: PrismaService;
    let repository: AuctionSettlementTransactionPrismaRepository;
    const now = new Date('2026-05-18T10:00:00.000Z');

    beforeAll(async () => {
      prisma = new PrismaService();
      await prisma.$connect();
      repository = new AuctionSettlementTransactionPrismaRepository(prisma);
    });

    beforeEach(async () => {
      await cleanAuctionLifecycleTestDatabase(prisma);
    });

    afterAll(async () => {
      await cleanAuctionLifecycleTestDatabase(prisma);
      await prisma.$disconnect();
    });

    async function createAuctionBase(
      params: {
        status?: AuctionStatus;
        endAt?: Date;
      } = {},
    ) {
      const seller = await createTestUser(prisma);
      const category = await createTestAuctionCategory(prisma);
      const auction = await createTestAuction(prisma, {
        sellerId: seller.id,
        categoryId: category.id,
        status: params.status,
        endAt: params.endAt,
      });

      return { seller, category, auction };
    }

    it('returns not-due without changing a live auction that has not ended', async () => {
      const { auction } = await createAuctionBase({
        endAt: new Date('2026-05-18T10:01:00.000Z'),
      });

      await expect(
        repository.settleAuctionIfDue({
          auctionId: auction.id,
          now,
        }),
      ).resolves.toEqual({
        settled: false,
        reason: 'not-due',
      });

      const unchangedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });
      expect(unchangedAuction.status).toBe(AuctionStatus.LIVE);
    });

    it('ends an auction without a winner and completes an empty settlement', async () => {
      const { auction } = await createAuctionBase();

      const result = await repository.settleAuctionIfDue({
        auctionId: auction.id,
        now,
      });

      const updatedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });
      const settlement = await prisma.auctionSettlement.findUniqueOrThrow({
        where: { auctionId: auction.id },
      });

      expect(result.settled).toBe(true);
      expect(updatedAuction.status).toBe(AuctionStatus.ENDED);
      expect(settlement).toMatchObject({
        auctionId: auction.id,
        winnerUserId: null,
        winningBidId: null,
        status: AuctionSettlementStatus.COMPLETED,
      });
      expect(settlement.finalAmount).toBeNull();
    });

    it('captures the winner hold, debits wallet, releases losing holds, and writes a settlement ledger', async () => {
      const { auction } = await createAuctionBase();
      const winner = await createTestUser(prisma);
      const loser = await createTestUser(prisma);
      const winnerWallet = await createTestWallet(prisma, winner.id, {
        balance: '100000',
        lockedBalance: '75000',
      } as any);
      const loserWallet = await createTestWallet(prisma, loser.id, {
        balance: '50000',
        lockedBalance: '30000',
      } as any);
      const winningBid = await createTestBid(prisma, {
        auctionId: auction.id,
        bidderId: winner.id,
        amount: '75000',
        status: BidStatus.WINNING,
      });
      const losingBid = await createTestBid(prisma, {
        auctionId: auction.id,
        bidderId: loser.id,
        amount: '30000',
        status: BidStatus.OUTBID,
      });
      const winnerHold = await createActiveBidHold(prisma, {
        walletId: winnerWallet.id,
        userId: winner.id,
        auctionId: auction.id,
        amount: '75000',
      });
      const loserHold = await createActiveBidHold(prisma, {
        walletId: loserWallet.id,
        userId: loser.id,
        auctionId: auction.id,
        amount: '30000',
      });

      const result = await repository.settleAuctionIfDue({
        auctionId: auction.id,
        now,
      });

      const updatedWinnerWallet = await prisma.wallet.findUniqueOrThrow({
        where: { id: winnerWallet.id },
      });
      const updatedLoserWallet = await prisma.wallet.findUniqueOrThrow({
        where: { id: loserWallet.id },
      });
      const capturedHold = await prisma.walletHold.findUniqueOrThrow({
        where: { id: winnerHold.id },
      });
      const releasedHold = await prisma.walletHold.findUniqueOrThrow({
        where: { id: loserHold.id },
      });
      const updatedWinningBid = await prisma.bid.findUniqueOrThrow({
        where: { id: winningBid.id },
      });
      const updatedLosingBid = await prisma.bid.findUniqueOrThrow({
        where: { id: losingBid.id },
      });
      const ledger = await prisma.walletLedgerEntry.findUniqueOrThrow({
        where: { idempotencyKey: `AUCTION_CAPTURE_${auction.id}` },
      });
      const settlement = await prisma.auctionSettlement.findUniqueOrThrow({
        where: { auctionId: auction.id },
      });

      expect(result.settled).toBe(true);
      expectDecimal(updatedWinnerWallet.balance, '25000');
      expectDecimal(updatedWinnerWallet.lockedBalance, '0');
      expectDecimal(updatedLoserWallet.balance, '50000');
      expectDecimal(updatedLoserWallet.lockedBalance, '0');
      expect(capturedHold.status).toBe(WalletHoldStatus.CAPTURED);
      expect(capturedHold.capturedAt).toEqual(now);
      expect(releasedHold.status).toBe(WalletHoldStatus.RELEASED);
      expect(updatedWinningBid.status).toBe(BidStatus.WON);
      expect(updatedLosingBid.status).toBe(BidStatus.LOST);
      expect(ledger).toMatchObject({
        walletId: winnerWallet.id,
        userId: winner.id,
        direction: WalletLedgerDirection.DEBIT,
        type: WalletLedgerType.BID_HOLD_CAPTURED,
        referenceType: 'AUCTION',
        referenceId: auction.id,
      });
      expectDecimal(ledger.amount, '75000');
      expectDecimal(ledger.balanceAfter, '25000');
      expectDecimal(ledger.lockedAfter, '0');
      expect(settlement).toMatchObject({
        auctionId: auction.id,
        winnerUserId: winner.id,
        winningBidId: winningBid.id,
        status: AuctionSettlementStatus.COMPLETED,
      });
      expectDecimal(settlement.finalAmount!, '75000');
    });

    it('is idempotent when the auction has already ended with a settlement', async () => {
      const { auction } = await createAuctionBase({
        status: AuctionStatus.ENDED,
      });
      const settlement = await prisma.auctionSettlement.create({
        data: {
          auction: {
            connect: { id: auction.id },
          },
          status: AuctionSettlementStatus.COMPLETED,
          processedAt: now,
        },
      });

      await expect(
        repository.settleAuctionIfDue({
          auctionId: auction.id,
          now,
        }),
      ).resolves.toMatchObject({
        settled: false,
        reason: 'already-ended',
        settlement: {
          id: settlement.id,
        },
      });

      await expect(prisma.auctionSettlement.count()).resolves.toBe(1);
    });

    it('enforces a single winning bid per auction at the database level', async () => {
      const { auction } = await createAuctionBase();
      const bidderOne = await createTestUser(prisma);
      const bidderTwo = await createTestUser(prisma);
      await createTestBid(prisma, {
        auctionId: auction.id,
        bidderId: bidderOne.id,
        amount: '75000',
        status: BidStatus.WINNING,
      });

      await expect(
        createTestBid(prisma, {
          auctionId: auction.id,
          bidderId: bidderTwo.id,
          amount: '80000',
          status: BidStatus.WINNING,
        }),
      ).rejects.toMatchObject({
        code: 'P2002',
      });

      const unchangedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });
      const winningBidCount = await prisma.bid.count({
        where: {
          auctionId: auction.id,
          status: BidStatus.WINNING,
        },
      });
      const settlementCount = await prisma.auctionSettlement.count();
      expect(unchangedAuction.status).toBe(AuctionStatus.LIVE);
      expect(winningBidCount).toBe(1);
      expect(settlementCount).toBe(0);
    });

    it('throws and rolls back when the winner hold is missing', async () => {
      const { auction } = await createAuctionBase();
      const winner = await createTestUser(prisma);
      await createTestWallet(prisma, winner.id, {
        balance: '100000',
        lockedBalance: '75000',
      } as any);
      const winningBid = await createTestBid(prisma, {
        auctionId: auction.id,
        bidderId: winner.id,
        amount: '75000',
        status: BidStatus.WINNING,
      });

      await expect(
        repository.settleAuctionIfDue({
          auctionId: auction.id,
          now,
        }),
      ).rejects.toMatchObject({
        code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
      });

      const unchangedBid = await prisma.bid.findUniqueOrThrow({
        where: { id: winningBid.id },
      });
      const settlementCount = await prisma.auctionSettlement.count();
      expect(unchangedBid.status).toBe(BidStatus.WINNING);
      expect(settlementCount).toBe(0);
    });
  },
);
