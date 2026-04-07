import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller('/admin/auctions')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.auctionService.cancel(id, req.user.id, req.role);
  }
}
