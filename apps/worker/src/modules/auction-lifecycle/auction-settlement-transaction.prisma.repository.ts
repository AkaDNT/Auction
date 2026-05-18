import { Injectable } from '@nestjs/common';
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
import { Decimal } from '@prisma/client/runtime/library';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  IAuctionSettlementTransactionRepository,
  SettleAuctionIfDueParams,
  SettleAuctionIfDueResult,
} from './auction-settlement-transaction.repository';

@Injectable()
export class AuctionSettlementTransactionPrismaRepository implements IAuctionSettlementTransactionRepository {
  private readonly maxSerializableRetries = 3;

  constructor(private readonly prisma: PrismaService) {}

  async settleAuctionIfDue(
    params: SettleAuctionIfDueParams,
  ): Promise<SettleAuctionIfDueResult> {
    return this.executeWithSerializableRetry(() =>
      this.prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`
            SELECT id FROM "Auction"
            WHERE id = ${params.auctionId}
            FOR UPDATE
          `;

          const auction = await tx.auction.findUnique({
            where: { id: params.auctionId },
          });

          if (!auction) {
            throw new AppException(
              {
                code: ERROR_CODES.AUCTION_NOT_FOUND,
                message: 'Không tìm thấy phiên đấu giá',
                details: { auctionId: params.auctionId },
              },
              404,
            );
          }

          if (auction.status === AuctionStatus.ENDED) {
            const settlement = await tx.auctionSettlement.findUnique({
              where: { auctionId: auction.id },
            });

            return {
              settled: false,
              reason: settlement
                ? 'already-ended'
                : 'already-ended-without-settlement',
              settlement: settlement ?? undefined,
            };
          }

          if (auction.status !== AuctionStatus.LIVE) {
            return {
              settled: false,
              reason: `invalid-status-${auction.status}`,
            };
          }

          if (auction.endAt > params.now) {
            return {
              settled: false,
              reason: 'not-due',
            };
          }

          const winningBids = await tx.bid.findMany({
            where: {
              auctionId: auction.id,
              status: BidStatus.WINNING,
            },
            orderBy: [
              {
                amount: 'desc',
              },
              {
                createdAt: 'asc',
              },
            ],
            take: 2,
          });

          if (winningBids.length > 1) {
            throw new AppException(
              {
                code: ERROR_CODES.AUCTION_INVALID_STATUS,
                message: 'Phiên đấu giá có nhiều hơn một bid thắng',
                details: {
                  auctionId: auction.id,
                  winningBidIds: winningBids.map((bid) => bid.id),
                },
              },
              409,
            );
          }

          if (winningBids.length === 0) {
            await this.releaseRemainingActiveAuctionHolds(tx, {
              auctionId: auction.id,
            });

            await tx.bid.updateMany({
              where: {
                auctionId: auction.id,
                status: {
                  in: [BidStatus.VALID, BidStatus.OUTBID, BidStatus.WINNING],
                },
              },
              data: {
                status: BidStatus.LOST,
              },
            });

            const auctionUpdateResult = await tx.auction.updateMany({
              where: {
                id: auction.id,
                status: AuctionStatus.LIVE,
              },
              data: {
                status: AuctionStatus.ENDED,
              },
            });

            if (auctionUpdateResult.count !== 1) {
              throw new AppException(
                {
                  code: ERROR_CODES.AUCTION_INVALID_STATUS,
                  message:
                    'Không thể chuyển auction sang trạng thái ENDED khi không có bid thắng',
                  details: {
                    auctionId: auction.id,
                  },
                },
                409,
              );
            }

            const settlement = await tx.auctionSettlement.upsert({
              where: { auctionId: auction.id },
              update: {
                winnerUserId: null,
                winningBidId: null,
                finalAmount: null,
                status: AuctionSettlementStatus.COMPLETED,
                processedAt: params.now,
                failureReason: null,
              },
              create: {
                auction: {
                  connect: { id: auction.id },
                },
                status: AuctionSettlementStatus.COMPLETED,
                processedAt: params.now,
              },
            });

            return {
              settled: true,
              settlement,
            };
          }

          const winningBid = winningBids[0];
          const finalAmount = new Decimal(winningBid.amount);

          const winnerWallet = await tx.wallet.findUnique({
            where: { userId: winningBid.bidderId },
          });

          if (!winnerWallet) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_NOT_FOUND,
                message: 'Không tìm thấy ví của người thắng đấu giá',
                details: {
                  auctionId: auction.id,
                  winnerUserId: winningBid.bidderId,
                },
              },
              404,
            );
          }

          await tx.$queryRaw`
            SELECT id FROM "Wallet"
            WHERE id = ${winnerWallet.id}
            FOR UPDATE
          `;

          const winnerHold = await tx.walletHold.findFirst({
            where: {
              walletId: winnerWallet.id,
              userId: winningBid.bidderId,
              type: WalletHoldType.BID,
              status: WalletHoldStatus.ACTIVE,
              referenceType: 'AUCTION',
              referenceId: auction.id,
              amount: finalAmount,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          if (!winnerHold) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
                message: 'Không tìm thấy khoản hold của người thắng đấu giá',
                details: {
                  auctionId: auction.id,
                  winningBidId: winningBid.id,
                  winnerUserId: winningBid.bidderId,
                  finalAmount: finalAmount.toString(),
                },
              },
              409,
            );
          }

          await tx.$queryRaw`
            SELECT id FROM "WalletHold"
            WHERE id = ${winnerHold.id}
            FOR UPDATE
          `;

          const holdAmount = new Decimal(winnerHold.amount);

          if (!holdAmount.equals(finalAmount)) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_INVALID_STATE,
                message: 'Số tiền hold không khớp với bid thắng',
                details: {
                  auctionId: auction.id,
                  winningBidId: winningBid.id,
                  holdAmount: holdAmount.toString(),
                  finalAmount: finalAmount.toString(),
                },
              },
              409,
            );
          }

          const holdCaptureResult = await tx.walletHold.updateMany({
            where: {
              id: winnerHold.id,
              status: WalletHoldStatus.ACTIVE,
            },
            data: {
              status: WalletHoldStatus.CAPTURED,
              capturedAt: params.now,
              reason: 'Auction payment captured',
            },
          });

          if (holdCaptureResult.count !== 1) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_INVALID_STATE,
                message: 'Khoản hold không còn active tại thời điểm capture',
                details: {
                  auctionId: auction.id,
                  winningBidId: winningBid.id,
                  holdId: winnerHold.id,
                },
              },
              409,
            );
          }

          const walletUpdateResult = await tx.wallet.updateMany({
            where: {
              id: winnerWallet.id,
              balance: {
                gte: finalAmount,
              },
              lockedBalance: {
                gte: finalAmount,
              },
            },
            data: {
              balance: {
                decrement: finalAmount,
              },
              lockedBalance: {
                decrement: finalAmount,
              },
            },
          });

          if (walletUpdateResult.count !== 1) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_INVALID_STATE,
                message: 'Trạng thái ví không hợp lệ khi quyết toán auction',
                details: {
                  walletId: winnerWallet.id,
                  auctionId: auction.id,
                  winningBidId: winningBid.id,
                  balance: winnerWallet.balance.toString(),
                  lockedBalance: winnerWallet.lockedBalance.toString(),
                  finalAmount: finalAmount.toString(),
                },
              },
              409,
            );
          }

          const updatedWallet = await tx.wallet.findUnique({
            where: { id: winnerWallet.id },
          });

          if (!updatedWallet) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_NOT_FOUND,
                message: 'Không tìm thấy ví sau khi cập nhật',
                details: {
                  walletId: winnerWallet.id,
                  auctionId: auction.id,
                },
              },
              404,
            );
          }

          const winningBidUpdateResult = await tx.bid.updateMany({
            where: {
              id: winningBid.id,
              auctionId: auction.id,
              status: BidStatus.WINNING,
            },
            data: {
              status: BidStatus.WON,
            },
          });

          if (winningBidUpdateResult.count !== 1) {
            throw new AppException(
              {
                code: ERROR_CODES.AUCTION_INVALID_STATUS,
                message: 'Bid thắng không còn ở trạng thái WINNING',
                details: {
                  auctionId: auction.id,
                  winningBidId: winningBid.id,
                },
              },
              409,
            );
          }

          await tx.bid.updateMany({
            where: {
              auctionId: auction.id,
              id: {
                not: winningBid.id,
              },
              status: {
                in: [BidStatus.VALID, BidStatus.OUTBID, BidStatus.WINNING],
              },
            },
            data: {
              status: BidStatus.LOST,
            },
          });

          await this.releaseRemainingActiveAuctionHolds(tx, {
            auctionId: auction.id,
            excludeHoldId: winnerHold.id,
          });

          const auctionUpdateResult = await tx.auction.updateMany({
            where: {
              id: auction.id,
              status: AuctionStatus.LIVE,
            },
            data: {
              status: AuctionStatus.ENDED,
              currentPrice: finalAmount,
            },
          });

          if (auctionUpdateResult.count !== 1) {
            throw new AppException(
              {
                code: ERROR_CODES.AUCTION_INVALID_STATUS,
                message: 'Không thể chuyển auction sang trạng thái ENDED',
                details: {
                  auctionId: auction.id,
                },
              },
              409,
            );
          }

          await tx.walletLedgerEntry.create({
            data: {
              wallet: {
                connect: { id: updatedWallet.id },
              },
              user: {
                connect: { id: winningBid.bidderId },
              },
              direction: WalletLedgerDirection.DEBIT,
              type: WalletLedgerType.BID_HOLD_CAPTURED,
              amount: finalAmount,
              balanceAfter: updatedWallet.balance,
              lockedAfter: updatedWallet.lockedBalance,
              referenceType: 'AUCTION',
              referenceId: auction.id,
              idempotencyKey: `AUCTION_CAPTURE_${auction.id}`,
              note: 'Auction payment captured from winning bidder',
            },
          });

          const settlement = await tx.auctionSettlement.upsert({
            where: { auctionId: auction.id },
            update: {
              winnerUserId: winningBid.bidderId,
              winningBidId: winningBid.id,
              finalAmount,
              status: AuctionSettlementStatus.COMPLETED,
              processedAt: params.now,
              failureReason: null,
            },
            create: {
              auction: {
                connect: { id: auction.id },
              },
              winnerUserId: winningBid.bidderId,
              winningBidId: winningBid.id,
              finalAmount,
              status: AuctionSettlementStatus.COMPLETED,
              processedAt: params.now,
            },
          });

          return {
            settled: true,
            settlement,
          };
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 5_000,
          timeout: 15_000,
        },
      ),
    );
  }

  private async releaseRemainingActiveAuctionHolds(
    tx: Prisma.TransactionClient,
    params: {
      auctionId: string;
      excludeHoldId?: string;
    },
  ): Promise<void> {
    const activeHolds = await tx.walletHold.findMany({
      where: {
        type: WalletHoldType.BID,
        status: WalletHoldStatus.ACTIVE,
        referenceType: 'AUCTION',
        referenceId: params.auctionId,
        ...(params.excludeHoldId
          ? {
              id: {
                not: params.excludeHoldId,
              },
            }
          : {}),
      },
      select: {
        id: true,
        walletId: true,
        amount: true,
      },
    });

    if (activeHolds.length === 0) {
      return;
    }

    const releaseAmountByWalletId = new Map<string, Decimal>();

    for (const hold of activeHolds) {
      const previousAmount =
        releaseAmountByWalletId.get(hold.walletId) ?? new Decimal(0);

      releaseAmountByWalletId.set(
        hold.walletId,
        previousAmount.plus(new Decimal(hold.amount)),
      );
    }

    for (const [walletId, releaseAmount] of releaseAmountByWalletId.entries()) {
      if (releaseAmount.lessThanOrEqualTo(0)) {
        continue;
      }

      await tx.$queryRaw`
        SELECT id FROM "Wallet"
        WHERE id = ${walletId}
        FOR UPDATE
      `;

      const walletReleaseResult = await tx.wallet.updateMany({
        where: {
          id: walletId,
          lockedBalance: {
            gte: releaseAmount,
          },
        },
        data: {
          lockedBalance: {
            decrement: releaseAmount,
          },
        },
      });

      if (walletReleaseResult.count !== 1) {
        throw new AppException(
          {
            code: ERROR_CODES.WALLET_INVALID_STATE,
            message: 'Không thể release hold vì lockedBalance không hợp lệ',
            details: {
              walletId,
              auctionId: params.auctionId,
              releaseAmount: releaseAmount.toString(),
            },
          },
          409,
        );
      }
    }

    await tx.walletHold.updateMany({
      where: {
        id: {
          in: activeHolds.map((hold) => hold.id),
        },
        status: WalletHoldStatus.ACTIVE,
      },
      data: {
        status: WalletHoldStatus.RELEASED,
        releasedAt: new Date(),
        reason: 'Auction hold released during settlement',
      },
    });
  }

  private async executeWithSerializableRetry<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxSerializableRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (
          !this.isSerializableConflict(error) ||
          attempt === this.maxSerializableRetries
        ) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private isSerializableConflict(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2034'
    );
  }
}
