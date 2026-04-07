import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionCategoryDto } from './create-auction-category.dto';

export class UpdateAuctionCategoryDto extends PartialType(
  CreateAuctionCategoryDto,
) {}
