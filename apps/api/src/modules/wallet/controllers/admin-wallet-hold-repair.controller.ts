import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@repo/db';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { WalletHoldRepairService } from '../services/wallet-hold-repair.service';

@Controller('admin/wallet/holds')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminWalletHoldRepairController {
  constructor(
    private readonly walletHoldRepairService: WalletHoldRepairService,
  ) {}

  @Get('stale-bid-holds')
  findStaleBidHolds(@Query('limit') limit?: string) {
    return this.walletHoldRepairService.findStaleBidHolds(Number(limit || 100));
  }
}
