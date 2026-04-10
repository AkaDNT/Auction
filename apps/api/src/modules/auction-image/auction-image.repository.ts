import { AuctionImage } from '@prisma/client';

export const AUCTION_IMAGE_REPOSITORY = Symbol('AUCTION_IMAGE_REPOSITORY');

export interface IAuctionImageRepository {
  create(data: {
    auctionId: string;
    imageUrl: string;
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
  }): Promise<AuctionImage>;

  findById(id: string): Promise<AuctionImage | null>;

  findByAuctionId(auctionId: string): Promise<AuctionImage[]>;

  update(
    id: string,
    data: Partial<{
      imageUrl: string;
      altText: string | null;
      sortOrder: number;
      isPrimary: boolean;
    }>,
  ): Promise<AuctionImage>;

  delete(id: string): Promise<AuctionImage>;

  clearPrimaryByAuctionId(auctionId: string): Promise<void>;
}
