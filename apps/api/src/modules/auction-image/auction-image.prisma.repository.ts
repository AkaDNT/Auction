import { Injectable } from '@nestjs/common';
import { AuctionImage } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAuctionImageRepository } from './auction-image.repository';

@Injectable()
export class AuctionImagePrismaRepository implements IAuctionImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    auctionId: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
  }): Promise<AuctionImage> {
    return this.prisma.auctionImage.create({
      data,
    });
  }

  findById(id: string): Promise<AuctionImage | null> {
    return this.prisma.auctionImage.findUnique({
      where: { id },
    });
  }

  findByAuctionId(auctionId: string): Promise<AuctionImage[]> {
    return this.prisma.auctionImage.findMany({
      where: { auctionId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  update(
    id: string,
    data: Partial<{
      imageUrl: string;
      altText: string | null;
      sortOrder: number;
      isPrimary: boolean;
    }>,
  ): Promise<AuctionImage> {
    return this.prisma.auctionImage.update({
      where: { id },
      data,
    });
  }

  delete(id: string): Promise<AuctionImage> {
    return this.prisma.auctionImage.delete({
      where: { id },
    });
  }

  async clearPrimaryByAuctionId(auctionId: string): Promise<void> {
    await this.prisma.auctionImage.updateMany({
      where: { auctionId, isPrimary: true },
      data: { isPrimary: false },
    });
  }
}
