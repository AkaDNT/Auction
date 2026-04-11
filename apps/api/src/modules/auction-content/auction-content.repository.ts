import { AuctionFaq, AuctionFeature } from '@prisma/client';

export const AUCTION_CONTENT_REPOSITORY = Symbol('AUCTION_CONTENT_REPOSITORY');

export interface IAuctionContentRepository {
  createFeature(data: {
    title: string;
    description: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AuctionFeature>;

  updateFeature(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<AuctionFeature>;

  findAllFeatures(isActive?: boolean): Promise<AuctionFeature[]>;

  findFeatureById(id: string): Promise<AuctionFeature | null>;

  createFaq(data: {
    question: string;
    answer: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<AuctionFaq>;

  updateFaq(
    id: string,
    data: Partial<{
      question: string;
      answer: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ): Promise<AuctionFaq>;

  findAllFaqs(isActive?: boolean): Promise<AuctionFaq[]>;

  findFaqById(id: string): Promise<AuctionFaq | null>;
}
