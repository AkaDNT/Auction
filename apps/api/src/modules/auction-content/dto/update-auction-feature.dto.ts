import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionFeatureDto } from './create-auction-feature.dto';

export class UpdateAuctionFeatureDto extends PartialType(
  CreateAuctionFeatureDto,
) {}
