import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuctionFaqDto {
  @IsString()
  @MaxLength(300)
  question!: string;

  @IsString()
  answer!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
