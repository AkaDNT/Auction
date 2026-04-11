import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionFaqDto } from './create-auction-faq.dto';

export class UpdateAuctionFaqDto extends PartialType(CreateAuctionFaqDto) {}
