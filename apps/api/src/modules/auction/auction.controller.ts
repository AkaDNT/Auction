import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { ListAuctionDto } from './dto/list-auction.dto';

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Get()
  findAll(@Query() query: ListAuctionDto) {
    return this.auctionService.findAll(query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.auctionService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auctionService.findOne(id);
  }
}
