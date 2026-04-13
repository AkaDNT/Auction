import { Injectable } from '@nestjs/common';
import { Auction, AuctionStatus, Prisma } from '@prisma/client';
import { IAuctionRepository } from './auction.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuctionEndTimeFilter,
  AuctionPriceRangeFilter,
  AuctionSortBy,
} from './dto/list-auction.dto';

@Injectable()
export class AuctionPrismaRepository implements IAuctionRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AuctionCreateInput): Promise<Auction> {
    return this.prisma.auction.create({ data });
  }

  update(id: string, data: Prisma.AuctionUpdateInput): Promise<Auction> {
    return this.prisma.auction.update({
      where: { id },
      data,
    });
  }

  findById(id: string): Promise<Auction | null> {
    return this.prisma.auction.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { bids: true },
        },
      },
    });
  }

  findBySlug(slug: string): Promise<Auction | null> {
    return this.prisma.auction.findUnique({
      where: { slug },
      include: {
        category: true,
        seller: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { bids: true },
        },
      },
    });
  }

  findByCode(code: string): Promise<Auction | null> {
    return this.prisma.auction.findUnique({
      where: { code },
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerSlug?: string;
    endTimeFilter?: AuctionEndTimeFilter;
    priceRangeFilter?: AuctionPriceRangeFilter;
    sortBy?: AuctionSortBy;
  }): Promise<any[]> {
    const {
      page,
      limit,
      search,
      categoryId,
      status,
      sellerSlug,
      endTimeFilter,
      priceRangeFilter,
      sortBy,
    } = params;

    const where: Prisma.AuctionWhereInput = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
      ...(sellerSlug
        ? {
            seller: {
              slug: sellerSlug,
            },
          }
        : {}),
      ...this.buildEndTimeFilter(endTimeFilter),
      ...this.buildPriceRangeFilter(priceRangeFilter),
    };

    return this.prisma.auction.findMany({
      where,
      include: {
        category: true,
        seller: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: this.buildOrderBy(sortBy),
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findFeaturedLiveAuctions(limit: number): Promise<any[]> {
    return this.prisma.auction.findMany({
      where: {
        status: AuctionStatus.LIVE,
      },
      include: {
        category: true,
        seller: true,
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: [
        {
          bids: {
            _count: 'desc',
          },
        },
        {
          createdAt: 'desc',
        },
      ],
      take: limit,
    });
  }

  count(params: {
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerSlug?: string;
    endTimeFilter?: AuctionEndTimeFilter;
    priceRangeFilter?: AuctionPriceRangeFilter;
  }): Promise<number> {
    const {
      search,
      categoryId,
      status,
      sellerSlug,
      endTimeFilter,
      priceRangeFilter,
    } = params;

    const where: Prisma.AuctionWhereInput = {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
      ...(sellerSlug
        ? {
            seller: {
              slug: sellerSlug,
            },
          }
        : {}),
      ...this.buildEndTimeFilter(endTimeFilter),
      ...this.buildPriceRangeFilter(priceRangeFilter),
    };

    return this.prisma.auction.count({ where });
  }

  delete(id: string): Promise<Auction> {
    return this.prisma.auction.delete({
      where: { id },
    });
  }

  private buildOrderBy(
    sortBy?: AuctionSortBy,
  ): Prisma.AuctionOrderByWithRelationInput[] {
    switch (sortBy) {
      case AuctionSortBy.ENDING_SOON:
        return [{ endAt: 'asc' }, { createdAt: 'desc' }];

      case AuctionSortBy.HIGHEST_PRICE:
        return [{ currentPrice: 'desc' }, { createdAt: 'desc' }];

      case AuctionSortBy.LOWEST_PRICE:
        return [{ currentPrice: 'asc' }, { createdAt: 'desc' }];

      case AuctionSortBy.NEWEST:
      default:
        return [{ createdAt: 'desc' }];
    }
  }

  private buildPriceRangeFilter(
    filter?: AuctionPriceRangeFilter,
  ): Prisma.AuctionWhereInput {
    switch (filter) {
      case AuctionPriceRangeFilter.BELOW_1M:
        return {
          currentPrice: {
            lt: 1_000_000,
          },
        };

      case AuctionPriceRangeFilter.FROM_1M_TO_5M:
        return {
          currentPrice: {
            gte: 1_000_000,
            lte: 5_000_000,
          },
        };

      case AuctionPriceRangeFilter.ABOVE_5M:
        return {
          currentPrice: {
            gt: 5_000_000,
          },
        };

      case AuctionPriceRangeFilter.ALL:
      default:
        return {};
    }
  }

  private buildEndTimeFilter(
    filter?: AuctionEndTimeFilter,
  ): Prisma.AuctionWhereInput {
    const now = new Date();

    switch (filter) {
      case AuctionEndTimeFilter.WITHIN_1_HOUR: {
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        return {
          endAt: {
            gte: now,
            lte: oneHourLater,
          },
        };
      }

      case AuctionEndTimeFilter.TODAY: {
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        return {
          endAt: {
            gte: now,
            lte: endOfToday,
          },
        };
      }

      case AuctionEndTimeFilter.THIS_WEEK: {
        const endOfWeek = new Date(now);
        const currentDay = endOfWeek.getDay();
        const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

        endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          endAt: {
            gte: now,
            lte: endOfWeek,
          },
        };
      }

      case AuctionEndTimeFilter.ALL:
      default:
        return {};
    }
  }
}
