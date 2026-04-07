import { Injectable } from '@nestjs/common';
import { Auction, AuctionStatus, Prisma } from '@prisma/client';
import { IAuctionRepository } from './auction.repository';
import { PrismaService } from 'src/prisma/prisma.service';

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
    });
  }

  findBySlug(slug: string): Promise<Auction | null> {
    return this.prisma.auction.findUnique({
      where: { slug },
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
    sellerId?: string;
  }): Promise<any[]> {
    const { page, limit, search, categoryId, status, sellerId } = params;

    return this.prisma.auction.findMany({
      where: {
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
      },
      include: {
        category: true,
        seller: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  count(params: {
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerId?: string;
  }): Promise<number> {
    const { search, categoryId, status, sellerId } = params;

    return this.prisma.auction.count({
      where: {
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
      },
    });
  }

  delete(id: string): Promise<Auction> {
    return this.prisma.auction.delete({
      where: { id },
    });
  }
}
