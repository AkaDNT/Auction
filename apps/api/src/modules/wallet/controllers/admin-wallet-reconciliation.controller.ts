import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@repo/db';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { WalletReconciliationService } from '../services/admin-wallet-reconciliation.service';

@Controller('admin/wallet/reconciliation')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminWalletReconciliationController {
  constructor(
    private readonly walletReconciliationService: WalletReconciliationService,
  ) {}

  @Get('wallets/:walletId')
  reconcileWallet(@Param('walletId') walletId: string) {
    return this.walletReconciliationService.reconcileWallet(walletId);
  }

  @Get('inconsistent-wallets')
  findInconsistentWallets(@Query('limit') limit?: string) {
    return this.walletReconciliationService.findInconsistentWallets(
      Number(limit || 100),
    );
  }
}
