import { Injectable } from '@nestjs/common';
import { AuctionFaq, AuctionFeature } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAuctionContentRepository } from './auction-content.repository';

@Injectable()
export class AuctionContentPrismaRepository implements IAuctionContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  createFeature(data: {
    title: string;
    description: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AuctionFeature> {
    return this.prisma.auctionFeature.create({ data });
  }

  updateFeature(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<AuctionFeature> {
    return this.prisma.auctionFeature.update({
      where: { id },
      data,
    });
  }

  findAllFeatures(isActive?: boolean): Promise<AuctionFeature[]> {
    return this.prisma.auctionFeature.findMany({
      where: isActive === undefined ? {} : { isActive },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findFeatureById(id: string): Promise<AuctionFeature | null> {
    return this.prisma.auctionFeature.findUnique({
      where: { id },
    });
  }

  createFaq(data: {
    question: string;
    answer: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AuctionFaq> {
    return this.prisma.auctionFaq.create({ data });
  }

  updateFaq(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<AuctionFaq> {
    return this.prisma.auctionFaq.update({
      where: { id },
      data,
    });
  }

  findAllFaqs(isActive?: boolean): Promise<AuctionFaq[]> {
    return this.prisma.auctionFaq.findMany({
      where: isActive === undefined ? {} : { isActive },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findFaqById(id: string): Promise<AuctionFaq | null> {
    return this.prisma.auctionFaq.findUnique({
      where: { id },
    });
  }
}
