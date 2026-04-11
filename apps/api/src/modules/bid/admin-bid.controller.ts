import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { BidService } from './bid.service';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller('/admin/bids')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminBidController {
  constructor(private readonly bidService: BidService) {}

  @Patch(':id/reject')
  rejectBid(@Param('id') id: string) {
    return this.bidService.rejectBid(id);
  }

  @Patch(':id/cancel')
  cancelBid(@Param('id') id: string) {
    return this.bidService.cancelBid(id);
  }
}
