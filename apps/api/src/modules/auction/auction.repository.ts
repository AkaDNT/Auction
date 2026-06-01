import { type Auction, type AuctionStatus, type Prisma } from '@prisma/client';

import { type CreateAuctionDataDto } from './dto/create-auction-data.dto';
import {
  type AuctionEndTimeFilter,
  type AuctionPriceRangeFilter,
  type AuctionSortBy,
} from './dto/list-auction.dto';
import { type UpdateAuctionDataDto } from './dto/update-auction-data.dto';

export const AUCTION_REPOSITORY = Symbol('AUCTION_REPOSITORY');

export interface IAuctionRepository {
  create(data: Prisma.AuctionCreateInput): Promise<Auction>;
  update(id: string, data: Prisma.AuctionUpdateInput): Promise<Auction>;
  findById(id: string): Promise<Auction | null>;
  findBySlug(slug: string): Promise<Auction | null>;
  findByCode(code: string): Promise<Auction | null>;

  createWithRelations(dto: CreateAuctionDataDto): Promise<Auction>;
  updateWithRelations(dto: UpdateAuctionDataDto): Promise<Auction>;

  findMany(params: {
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
  }): Promise<any[]>;

  count(params: {
    search?: string;
    categoryId?: string;
    status?: AuctionStatus;
    sellerId?: string;
    sellerSlug?: string;
    endTimeFilter?: AuctionEndTimeFilter;
    priceRangeFilter?: AuctionPriceRangeFilter;
  }): Promise<number>;

  findFeaturedLiveAuctions(limit: number): Promise<any[]>;
  delete(id: string): Promise<Auction>;
}
