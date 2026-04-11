import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuctionFeatureDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
