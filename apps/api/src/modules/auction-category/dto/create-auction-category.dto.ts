import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class CreateAuctionCategoryDto {
  @IsString()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(140)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
