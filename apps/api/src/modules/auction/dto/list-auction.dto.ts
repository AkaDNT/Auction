import { AuctionStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum AuctionEndTimeFilter {
  ALL = 'ALL',
  WITHIN_1_HOUR = 'WITHIN_1_HOUR',
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
}

export enum AuctionPriceRangeFilter {
  ALL = 'ALL',
  BELOW_1M = 'BELOW_1M',
  FROM_1M_TO_5M = 'FROM_1M_TO_5M',
  ABOVE_5M = 'ABOVE_5M',
}

export enum AuctionSortBy {
  NEWEST = 'NEWEST',
  ENDING_SOON = 'ENDING_SOON',
  HIGHEST_PRICE = 'HIGHEST_PRICE',
  LOWEST_PRICE = 'LOWEST_PRICE',
}

export class ListAuctionDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  limit = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(AuctionStatus)
  status?: AuctionStatus;

  @IsOptional()
  @IsString()
  sellerSlug?: string;

  @IsOptional()
  @IsEnum(AuctionEndTimeFilter)
  endTimeFilter?: AuctionEndTimeFilter = AuctionEndTimeFilter.ALL;

  @IsOptional()
  @IsEnum(AuctionPriceRangeFilter)
  priceRangeFilter?: AuctionPriceRangeFilter = AuctionPriceRangeFilter.ALL;

  @IsOptional()
  @IsEnum(AuctionSortBy)
  sortBy?: AuctionSortBy = AuctionSortBy.NEWEST;
}
