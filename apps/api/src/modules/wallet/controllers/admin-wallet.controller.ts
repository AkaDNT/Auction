import { Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@repo/db';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { WalletService } from '../services/wallet.service';

@Controller('admin/wallet')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminWalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('bootstrap')
  bootstrapMissingWallets() {
    return this.walletService.bootstrapMissingWallets();
  }
}
