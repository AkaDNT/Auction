import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  startingPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  buyNowPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(5000)
  minBidIncrement?: number;

  @IsOptional()
  @IsString()
  startAt?: string;

  @IsString()
  endAt!: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsString()
  categoryId!: string;
}
