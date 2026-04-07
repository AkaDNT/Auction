import { AuctionCategory } from '@prisma/client';

export const AUCTION_CATEGORY_REPOSITORY = Symbol(
  'AUCTION_CATEGORY_REPOSITORY',
);

export interface IAuctionCategoryRepository {
  create(data: {
    slug: string;
    label: string;
    description?: string | null;
  }): Promise<AuctionCategory>;

  update(
    id: string,
    data: Partial<{
      slug: string;
      label: string;
      description: string | null;
    }>,
  ): Promise<AuctionCategory>;

  findAll(): Promise<AuctionCategory[]>;
  findById(id: string): Promise<AuctionCategory | null>;
  findBySlug(slug: string): Promise<AuctionCategory | null>;
  delete(id: string): Promise<AuctionCategory>;
  countAuctions(categoryId: string): Promise<number>;
}
