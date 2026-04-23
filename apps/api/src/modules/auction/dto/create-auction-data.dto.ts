import { AuctionStatus } from '@prisma/client';
import { AuctionThumbnailAssetDto } from './auction-thumbnail-asset.dto';

export class CreateAuctionDataDto {
  code!: string;
  title!: string;
  slug!: string;
  description?: string;
  startingPrice!: number;
  currentPrice!: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startAt?: Date | null;
  endAt!: Date;
  status!: AuctionStatus;
  thumbnailUrl?: string | null;
  sellerId!: string;
  categoryId!: string;
  thumbnailAsset?: AuctionThumbnailAssetDto | null;
}
