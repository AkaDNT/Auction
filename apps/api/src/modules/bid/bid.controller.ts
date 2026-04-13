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

  @Get('auctions/:auctionId/bids/latest-100-by-amount')
  listLatest100AuctionBidsSortedByAmount(
    @Param('auctionId') auctionId: string,
  ) {
    return this.bidService.listLatest100AuctionBidsSortedByAmount(auctionId);
  }
}
