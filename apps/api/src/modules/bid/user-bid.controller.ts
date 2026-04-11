import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller()
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.USER, Role.SELLER, Role.ADMIN)
export class UserBidController {
  constructor(private readonly bidService: BidService) {}

  @Post('auctions/:auctionId/bids')
  placeBid(
    @Param('auctionId') auctionId: string,
    @Body() dto: CreateBidDto,
    @Req() req: any,
  ) {
    return this.bidService.placeBid(auctionId, req.user.id, dto);
  }
}
