import { AuctionThumbnailAssetDto } from './auction-thumbnail-asset.dto';

export class UpdateAuctionDataDto {
  id!: string;
  title?: string;
  slug?: string;
  description?: string;
  startingPrice?: number;
  currentPrice?: number;
  buyNowPrice?: number | null;
  minBidIncrement?: number;
  startAt?: Date | null;
  endAt?: Date;
  thumbnailUrl?: string | null;
  categoryId?: string;
  thumbnailAsset?: AuctionThumbnailAssetDto | null;
}
