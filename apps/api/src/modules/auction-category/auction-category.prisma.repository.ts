import { Injectable } from '@nestjs/common';
import { AuctionCategory } from '@prisma/client';
import { IAuctionCategoryRepository } from './auction-category.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuctionCategoryPrismaRepository implements IAuctionCategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    slug: string;
    label: string;
    description?: string | null;
  }): Promise<AuctionCategory> {
    return this.prisma.auctionCategory.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      slug: string;
      label: string;
      description: string | null;
    }>,
  ): Promise<AuctionCategory> {
    return this.prisma.auctionCategory.update({
      where: { id },
      data,
    });
  }

  findAll(): Promise<AuctionCategory[]> {
    return this.prisma.auctionCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<AuctionCategory | null> {
    return this.prisma.auctionCategory.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<AuctionCategory | null> {
    return this.prisma.auctionCategory.findUnique({ where: { slug } });
  }

  delete(id: string): Promise<AuctionCategory> {
    return this.prisma.auctionCategory.delete({ where: { id } });
  }

  countAuctions(categoryId: string): Promise<number> {
    return this.prisma.auction.count({
      where: { categoryId },
    });
  }
}
