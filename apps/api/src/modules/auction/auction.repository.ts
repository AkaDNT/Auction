import { Auction, AuctionStatus, Prisma } from '@prisma/client';

export const AUCTION_REPOSITORY = Symbol('AUCTION_REPOSITORY');

export interface IAuctionRepository {
  create(data: Prisma.AuctionCreateInput): Promise<Auction>;
  update(id: string, data: Prisma.AuctionUpdateInput): Promise<Auction>;
  findById(id: string): Promise<Auction | null>;
  findBySlug(slug: string): Promise<Auction | null>;
  findByCode(code: string): Promise<Auction | null>;
  delete(id: string): Promise<Auction>;

  findMany(params: {
    page: number;
    limit: number;
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerId?: string;
  }): Promise<any[]>;

  count(params: {
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerId?: string;
  }): Promise<number>;
}
