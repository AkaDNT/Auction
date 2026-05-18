import { Injectable } from '@nestjs/common';
import {
  AuctionStatus,
  Bid,
  BidStatus,
  Prisma,
  Wallet,
  WalletHoldStatus,
  WalletHoldType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  IBidTransactionRepository,
  PlaceBidParams,
} from './bid-transaction.repository';

@Injectable()
export class BidTransactionPrismaRepository implements IBidTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async runSerializableTransaction<T>(
    callback: () => Promise<T>,
  ): Promise<T> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await callback();
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxRetries
        ) {
          continue;
        }

        throw error;
      }
    }

    throw new Error('Serializable transaction failed after retries');
  }

  async placeBid(params: PlaceBidParams): Promise<Bid> {
    return this.runSerializableTransaction(() =>
      this.prisma.$transaction(
        async (tx) => {
          const now = new Date();
          const bidAmount = new Decimal(params.amount);

          const auction = await tx.auction.findUnique({
            where: { id: params.auctionId },
          });

          if (!auction) {
            throw new AppException(
              {
                code: ERROR_CODES.BID_AUCTION_NOT_FOUND,
                message: 'Không tìm thấy phiên đấu giá',
                details: { auctionId: params.auctionId },
              },
              404,
            );
          }

          if (auction.sellerId === params.bidderId) {
            throw new AppException(
              {
                code: ERROR_CODES.BID_SELF_BIDDING_NOT_ALLOWED,
                message: 'Người bán không thể tự đấu giá sản phẩm của mình',
                details: {
                  auctionId: auction.id,
                  bidderId: params.bidderId,
                },
              },
              400,
            );
          }

          if (auction.status !== AuctionStatus.LIVE || auction.endAt <= now) {
            throw new AppException(
              {
                code: ERROR_CODES.BID_AUCTION_NOT_LIVE,
                message: 'Phiên đấu giá không ở trạng thái có thể đặt giá',
                details: {
                  auctionId: auction.id,
                  status: auction.status,
                  endAt: auction.endAt,
                },
              },
              400,
            );
          }

          const currentPrice = new Decimal(
            auction.currentPrice ?? auction.startingPrice,
          );

          const minNextBid = currentPrice.plus(auction.minBidIncrement);

          if (bidAmount.lessThan(minNextBid)) {
            throw new AppException(
              {
                code: ERROR_CODES.BID_AMOUNT_TOO_LOW,
                message: 'Giá đặt không đạt mức tối thiểu',
                details: {
                  amount: bidAmount.toString(),
                  minNextBid: minNextBid.toString(),
                },
              },
              400,
            );
          }

          const previousWinningBid = await tx.bid.findFirst({
            where: {
              auctionId: auction.id,
              status: BidStatus.WINNING,
            },
            orderBy: {
              amount: 'desc',
            },
          });

          const isCurrentWinnerBiddingAgain =
            previousWinningBid?.bidderId === params.bidderId;

          const existingBidderHold = await tx.walletHold.findFirst({
            where: {
              userId: params.bidderId,
              type: WalletHoldType.BID,
              status: WalletHoldStatus.ACTIVE,
              referenceType: 'AUCTION',
              referenceId: auction.id,
            },
            orderBy: { createdAt: 'desc' },
          });

          if (existingBidderHold && !isCurrentWinnerBiddingAgain) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_HOLD_CONFLICT,
                message:
                  'Người đặt giá đang có khoản giữ tiền active bất thường cho phiên đấu giá này',
                details: {
                  auctionId: auction.id,
                  bidderId: params.bidderId,
                  holdId: existingBidderHold.id,
                },
              },
              409,
            );
          }

          if (isCurrentWinnerBiddingAgain && !existingBidderHold) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
                message:
                  'Không tìm thấy khoản giữ tiền hiện tại của người đang thắng',
                details: {
                  auctionId: auction.id,
                  bidderId: params.bidderId,
                  previousWinningBidId: previousWinningBid.id,
                },
              },
              409,
            );
          }

          const existingHoldAmount = existingBidderHold
            ? new Decimal(existingBidderHold.amount)
            : new Decimal(0);

          const additionalLockAmount = Decimal.max(
            bidAmount.minus(existingHoldAmount),
            new Decimal(0),
          );

          const updateAuctionResult = await tx.auction.updateMany({
            where: {
              id: auction.id,
              status: AuctionStatus.LIVE,
              endAt: {
                gt: now,
              },
              ...(auction.currentPrice === null
                ? { currentPrice: null }
                : { currentPrice: auction.currentPrice }),
            },
            data: {
              currentPrice: bidAmount,
            },
          });

          if (updateAuctionResult.count === 0) {
            throw new AppException(
              {
                code: ERROR_CODES.BID_AUCTION_PRICE_CHANGED,
                message: 'Giá hiện tại đã thay đổi, vui lòng đặt lại giá mới',
                details: {
                  auctionId: auction.id,
                  bidAmount: bidAmount.toString(),
                  previousSeenPrice: currentPrice.toString(),
                },
              },
              409,
            );
          }

          const bidderWallet = await tx.wallet.findUnique({
            where: { userId: params.bidderId },
          });

          if (!bidderWallet) {
            throw new AppException(
              {
                code: ERROR_CODES.WALLET_NOT_FOUND,
                message: 'Không tìm thấy ví của người đặt giá',
                details: { bidderId: params.bidderId },
              },
              404,
            );
          }

          let lockedBidderWallet: Wallet = bidderWallet;

          if (additionalLockAmount.greaterThan(0)) {
            const lockedBidderWalletRows = await tx.$queryRaw<Wallet[]>`
              UPDATE "Wallet"
              SET "lockedBalance" = "lockedBalance" + ${additionalLockAmount}
              WHERE "id" = ${bidderWallet.id}
                AND ("balance" - "lockedBalance") >= ${additionalLockAmount}
              RETURNING *
            `;

            const updatedWallet = lockedBidderWalletRows[0];

            if (!updatedWallet) {
              const latestWallet = await tx.wallet.findUnique({
                where: { id: bidderWallet.id },
              });

              const availableBalance = latestWallet
                ? new Decimal(latestWallet.balance).minus(
                    latestWallet.lockedBalance,
                  )
                : new Decimal(0);

              throw new AppException(
                {
                  code: ERROR_CODES.WALLET_INSUFFICIENT_AVAILABLE_BALANCE,
                  message: 'Số dư khả dụng không đủ để đặt giá',
                  details: {
                    auctionId: auction.id,
                    bidderId: params.bidderId,
                    bidAmount: bidAmount.toString(),
                    existingHoldAmount: existingHoldAmount.toString(),
                    additionalLockAmount: additionalLockAmount.toString(),
                    availableBalance: availableBalance.toString(),
                  },
                },
                400,
              );
            }

            lockedBidderWallet = updatedWallet;
          }

          let bidderHold = existingBidderHold;

          if (bidderHold) {
            bidderHold = await tx.walletHold.update({
              where: { id: bidderHold.id },
              data: {
                amount: bidAmount,
                reason: isCurrentWinnerBiddingAgain
                  ? 'Winning bid amount increased'
                  : 'Bid fund hold updated',
              },
            });
          } else {
            bidderHold = await tx.walletHold.create({
              data: {
                wallet: {
                  connect: { id: lockedBidderWallet.id },
                },
                user: {
                  connect: { id: params.bidderId },
                },
                type: WalletHoldType.BID,
                status: WalletHoldStatus.ACTIVE,
                amount: bidAmount,
                referenceType: 'AUCTION',
                referenceId: auction.id,
                reason: 'Bid fund hold',
              },
            });
          }

          if (previousWinningBid) {
            await tx.bid.updateMany({
              where: {
                auctionId: auction.id,
                status: BidStatus.WINNING,
              },
              data: {
                status: BidStatus.OUTBID,
              },
            });

            if (!isCurrentWinnerBiddingAgain) {
              const previousHold = await tx.walletHold.findFirst({
                where: {
                  userId: previousWinningBid.bidderId,
                  type: WalletHoldType.BID,
                  status: WalletHoldStatus.ACTIVE,
                  referenceType: 'AUCTION',
                  referenceId: auction.id,
                },
                orderBy: { createdAt: 'desc' },
              });

              if (!previousHold) {
                throw new AppException(
                  {
                    code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
                    message:
                      'Không tìm thấy khoản giữ tiền của người đang thắng trước đó',
                    details: {
                      auctionId: auction.id,
                      previousWinningBidId: previousWinningBid.id,
                      previousBidderId: previousWinningBid.bidderId,
                    },
                  },
                  409,
                );
              }

              const releasedPreviousWalletRows = await tx.$queryRaw<Wallet[]>`
                UPDATE "Wallet"
                SET "lockedBalance" = "lockedBalance" - ${previousHold.amount}
                WHERE "id" = ${previousHold.walletId}
                  AND "lockedBalance" >= ${previousHold.amount}
                RETURNING *
              `;

              const releasedPreviousWallet = releasedPreviousWalletRows[0];

              if (!releasedPreviousWallet) {
                throw new AppException(
                  {
                    code: ERROR_CODES.WALLET_LOCKED_BALANCE_INCONSISTENT,
                    message:
                      'Số dư đang bị giữ của ví người thắng trước đó không hợp lệ',
                    details: {
                      auctionId: auction.id,
                      previousWinningBidId: previousWinningBid.id,
                      previousHoldId: previousHold.id,
                      previousWalletId: previousHold.walletId,
                      releaseAmount: previousHold.amount.toString(),
                    },
                  },
                  409,
                );
              }

              await tx.walletHold.update({
                where: { id: previousHold.id },
                data: {
                  status: WalletHoldStatus.RELEASED,
                  releasedAt: now,
                  reason: 'Outbid by another bidder',
                },
              });
            }
          }

          const bid = await tx.bid.create({
            data: {
              auction: {
                connect: { id: auction.id },
              },
              bidder: {
                connect: { id: params.bidderId },
              },
              amount: bidAmount,
              status: BidStatus.WINNING,
            },
          });

          await tx.walletHold.update({
            where: { id: bidderHold.id },
            data: {
              reason: isCurrentWinnerBiddingAgain
                ? `Winning bid increased for bid ${bid.id}`
                : `Bid fund hold for bid ${bid.id}`,
            },
          });

          return bid;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      ),
    );
  }
}
