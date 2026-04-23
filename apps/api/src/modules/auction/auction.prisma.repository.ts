import { Injectable } from '@nestjs/common';
import {
  Auction,
  AuctionStatus,
  Prisma,
  UploadAssetStatus,
} from '@prisma/client';
import { IAuctionRepository } from './auction.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuctionEndTimeFilter,
  AuctionPriceRangeFilter,
  AuctionSortBy,
} from './dto/list-auction.dto';
import { CreateAuctionDataDto } from './dto/create-auction-data.dto';
import { UpdateAuctionDataDto } from './dto/update-auction-data.dto';

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

  async createWithRelations(dto: CreateAuctionDataDto): Promise<Auction> {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.create({
        data: {
          code: dto.code,
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          startingPrice: dto.startingPrice,
          currentPrice: dto.currentPrice,
          buyNowPrice: dto.buyNowPrice,
          minBidIncrement: dto.minBidIncrement,
          startAt: dto.startAt ?? null,
          endAt: dto.endAt,
          status: dto.status,
          thumbnailUrl: dto.thumbnailUrl ?? null,
          seller: {
            connect: { id: dto.sellerId },
          },
          category: {
            connect: { id: dto.categoryId },
          },
        },
      });

      if (dto.thumbnailAsset) {
        await tx.auctionImage.create({
          data: {
            auctionId: auction.id,
            imageUrl: dto.thumbnailAsset.fileUrl,
            storageKey: dto.thumbnailAsset.storageKey,
            altText: dto.title,
            sortOrder: 0,
            isPrimary: true,
          },
        });

        await tx.uploadAsset.update({
          where: { id: dto.thumbnailAsset.id },
          data: {
            status: UploadAssetStatus.CONSUMED,
            usedAt: new Date(),
          },
        });
      }

      return auction;
    });
  }

  async updateWithRelations(dto: UpdateAuctionDataDto): Promise<Auction> {
    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.AuctionUpdateInput = {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.startingPrice !== undefined
          ? { startingPrice: dto.startingPrice }
          : {}),
        ...(dto.currentPrice !== undefined
          ? { currentPrice: dto.currentPrice }
          : {}),
        ...(dto.buyNowPrice !== undefined
          ? { buyNowPrice: dto.buyNowPrice }
          : {}),
        ...(dto.minBidIncrement !== undefined
          ? { minBidIncrement: dto.minBidIncrement }
          : {}),
        ...(dto.startAt !== undefined ? { startAt: dto.startAt } : {}),
        ...(dto.endAt !== undefined ? { endAt: dto.endAt } : {}),
        ...(dto.thumbnailUrl !== undefined
          ? { thumbnailUrl: dto.thumbnailUrl }
          : {}),
        ...(dto.categoryId
          ? {
              category: {
                connect: { id: dto.categoryId },
              },
            }
          : {}),
      };

      const auction = await tx.auction.update({
        where: { id: dto.id },
        data,
      });

      if (dto.thumbnailAsset) {
        const primaryImage = await tx.auctionImage.findFirst({
          where: {
            auctionId: dto.id,
            isPrimary: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        });

        if (primaryImage) {
          await tx.auctionImage.update({
            where: { id: primaryImage.id },
            data: {
              imageUrl: dto.thumbnailAsset.fileUrl,
              storageKey: dto.thumbnailAsset.storageKey,
              altText: dto.title ?? auction.title,
              sortOrder: 0,
              isPrimary: true,
            },
          });
        } else {
          await tx.auctionImage.create({
            data: {
              auctionId: dto.id,
              imageUrl: dto.thumbnailAsset.fileUrl,
              storageKey: dto.thumbnailAsset.storageKey,
              altText: dto.title ?? auction.title,
              sortOrder: 0,
              isPrimary: true,
            },
          });
        }

        await tx.uploadAsset.update({
          where: { id: dto.thumbnailAsset.id },
          data: {
            status: UploadAssetStatus.CONSUMED,
            usedAt: new Date(),
          },
        });
      }

      return auction;
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerId?: string;
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
      sellerId,
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
      ...(sellerId ? { sellerId } : {}),
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
    sellerId?: string;
    sellerSlug?: string;
    endTimeFilter?: AuctionEndTimeFilter;
    priceRangeFilter?: AuctionPriceRangeFilter;
  }): Promise<number> {
    const {
      search,
      categoryId,
      status,
      sellerId,
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
      ...(sellerId ? { sellerId } : {}),
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
