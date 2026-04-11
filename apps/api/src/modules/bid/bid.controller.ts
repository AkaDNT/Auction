import { Controller, Get, Param, Query } from '@nestjs/common';
import { BidService } from './bid.service';
import { ListBidsDto } from './dto/list-bids.dto';

@Controller()
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Get('auctions/:auctionId/bids')
  listAuctionBids(
    @Param('auctionId') auctionId: string,
    @Query() query: ListBidsDto,
  ) {
    return this.bidService.listAuctionBids(auctionId, query);
  }
}
