import { PartialType } from '@nestjs/mapped-types';
import { AddAuctionImageDto } from './add-auction-image.dto';

export class UpdateAuctionImageDto extends PartialType(AddAuctionImageDto) {}
