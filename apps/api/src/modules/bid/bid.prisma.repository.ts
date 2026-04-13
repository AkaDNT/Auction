import { HttpStatus, Injectable } from '@nestjs/common';
import { AuctionStatus, Bid, BidStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IBidRepository } from './bid.repository';
import { AppException } from 'src/common/errors/app.exception';
import { ERROR_CODES } from '@repo/shared';
import { calculateMinimumAllowedBid } from 'src/common/utils/bid.util';

const BID_COOLDOWN_MS = Number(process.env.BID_COOLDOWN_MS);

@Injectable()
export class BidPrismaRepository implements IBidRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Bid | null> {
    return this.prisma.bid.findUnique({
      where: { id },
    });
  }

  findManyByAuction(
    auctionId: string,
    page: number,
    limit: number,
  ): Promise<any[]> {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findLatest100ByAuctionOrderByAmountAsc(
    auctionId: string,
  ): Promise<Bid[]> {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' }, // lấy 100 bid gần nhất
      take: 100,
    });

    return bids.sort((a, b) => {
      const amountCompare = a.amount.comparedTo(b.amount);

      if (amountCompare !== 0) return amountCompare;

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  countByAuction(auctionId: string): Promise<number> {
    return this.prisma.bid.count({
      where: { auctionId },
    });
  }

  async executePlaceBidTransaction(params: {
    auctionId: string;
    bidderId: string;
    amount: number;
  }): Promise<void> {
    const { auctionId, bidderId, amount } = params;

    await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<
        Array<{
          id: string;
          sellerId: string;
          status: AuctionStatus;
          startAt: Date | null;
          endAt: Date;
          currentPrice: Prisma.Decimal | null;
          startingPrice: Prisma.Decimal;
          minBidIncrement: Prisma.Decimal;
        }>
      >(Prisma.sql`
        SELECT
          "id",
          "sellerId",
          "status",
          "startAt",
          "endAt",
          "currentPrice",
          "startingPrice",
          "minBidIncrement"
        FROM "Auction"
        WHERE "id" = ${auctionId}
        FOR UPDATE
      `);

      const auction = rows[0];

      if (!auction) {
        throw new AppException(
          {
            code: ERROR_CODES.AUCTION_NOT_FOUND,
            message: 'Không tìm thấy phiên đấu giá',
            details: { auctionId },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const now = new Date();

      if (auction.status !== AuctionStatus.LIVE) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_AUCTION_NOT_LIVE,
            message: 'Phiên đấu giá hiện không ở trạng thái đang diễn ra',
            details: { auctionId, status: auction.status },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (auction.startAt && auction.startAt > now) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_AUCTION_NOT_STARTED,
            message: 'Phiên đấu giá chưa bắt đầu',
            details: { auctionId, startAt: auction.startAt },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (auction.endAt <= now) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_AUCTION_ALREADY_ENDED,
            message: 'Phiên đấu giá đã kết thúc',
            details: { auctionId, endAt: auction.endAt },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (auction.sellerId === bidderId) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_SELF_BIDDING_NOT_ALLOWED,
            message: 'Người bán không thể tự đấu giá phiên của mình',
            details: { auctionId, bidderId },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const highestBid = await tx.bid.findFirst({
        where: {
          auctionId,
          status: BidStatus.VALID,
        },
        orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
        select: {
          bidderId: true,
          amount: true,
          createdAt: true,
        },
      });

      if (highestBid && highestBid.bidderId === bidderId) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_CONSECUTIVE_SELF_BID_NOT_ALLOWED,
            message:
              'Bạn đang là người trả giá cao nhất, không thể tiếp tục tự nâng giá',
            details: {
              auctionId,
              bidderId,
              currentHighestBid: Number(highestBid.amount),
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const latestUserBid = await tx.bid.findFirst({
        where: {
          auctionId,
          bidderId,
          status: BidStatus.VALID,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
          amount: true,
        },
      });

      if (latestUserBid) {
        const diffMs = now.getTime() - latestUserBid.createdAt.getTime();

        if (diffMs < BID_COOLDOWN_MS) {
          throw new AppException(
            {
              code: ERROR_CODES.BID_TOO_FREQUENT,
              message:
                'Bạn đang đặt giá quá nhanh, vui lòng thử lại sau ít giây',
              details: {
                auctionId,
                bidderId,
                retryAfterMs: BID_COOLDOWN_MS - diffMs,
                lastBidAmount: Number(latestUserBid.amount),
              },
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
      }

      const bidRule = calculateMinimumAllowedBid({
        startingPrice: auction.startingPrice,
        currentPrice: auction.currentPrice,
        minBidIncrement: auction.minBidIncrement,
      });

      if (amount < bidRule.minimumAllowedBid) {
        throw new AppException(
          {
            code: ERROR_CODES.BID_AMOUNT_TOO_LOW,
            message: bidRule.hasExistingBid
              ? 'Giá trả phải lớn hơn hoặc bằng giá hiện tại cộng bước giá tối thiểu'
              : 'Giá trả đầu tiên phải lớn hơn hoặc bằng giá khởi điểm',
            details: {
              auctionId,
              amount,
              startingPrice: bidRule.startingPrice,
              currentPrice: bidRule.currentPrice,
              minBidIncrement: bidRule.minBidIncrement,
              minimumAllowedBid: bidRule.minimumAllowedBid,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await tx.bid.create({
        data: {
          auctionId,
          bidderId,
          amount: new Prisma.Decimal(amount),
        },
      });

      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: new Prisma.Decimal(amount),
        },
      });
    });
  }

  updateStatus(id: string, status: BidStatus): Promise<Bid> {
    return this.prisma.bid.update({
      where: { id },
      data: { status },
    });
  }
}
