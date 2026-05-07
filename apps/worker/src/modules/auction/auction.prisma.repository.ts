import { Injectable } from '@nestjs/common';
import { AuctionStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAuctionRepository } from './auction.repository';

@Injectable()
export class AuctionPrismaRepository implements IAuctionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async markEndedIfDue(auctionId: string, now: Date): Promise<boolean> {
    const result = await this.prisma.auction.updateMany({
      where: {
        id: auctionId,
        status: AuctionStatus.LIVE,
        endAt: {
          lte: now,
        },
      },
      data: {
        status: AuctionStatus.ENDED,
      },
    });

    return result.count > 0;
  }

  async markStartedIfDue(auctionId: string, now: Date): Promise<boolean> {
    const result = await this.prisma.auction.updateMany({
      where: {
        id: auctionId,
        status: AuctionStatus.UPCOMING,
        startAt: {
          not: null,
          lte: now,
        },
        endAt: {
          gt: now,
        },
      },
      data: {
        status: AuctionStatus.LIVE,
      },
    });

    return result.count > 0;
  }
}
