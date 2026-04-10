import { Controller, Get, Param } from '@nestjs/common';
import { AuctionImageService } from './auction-image.service';

@Controller()
export class AuctionImageController {
  constructor(private readonly imageService: AuctionImageService) {}

  @Get('auctions/:auctionId/images')
  listByAuction(@Param('auctionId') auctionId: string) {
    return this.imageService.listByAuction(auctionId);
  }
}
