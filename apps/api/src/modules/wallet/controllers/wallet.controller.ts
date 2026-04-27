import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { WalletService } from '../services/wallet.service';

@Controller('wallet')
@UseGuards(JwtAccessGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  getMyWallet(@Req() req: any) {
    return this.walletService.getMyWallet(req.user.id);
  }
}
