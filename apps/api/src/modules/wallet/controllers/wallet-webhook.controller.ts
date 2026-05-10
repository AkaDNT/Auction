import { Body, Controller, Post } from '@nestjs/common';
import { DepositProvider } from '@prisma/client';
import { DepositWebhookService } from '../services/deposit-webhook.service';

@Controller('wallet/webhooks')
export class WalletWebhookController {
  constructor(private readonly depositWebhookService: DepositWebhookService) {}

  @Post('momo')
  handleMomo(@Body() payload: any) {
    return this.depositWebhookService.handleProviderWebhook(
      DepositProvider.MOMO,
      payload,
    );
  }

  @Post('vnpay')
  handleVnpay(@Body() payload: any) {
    return this.depositWebhookService.handleProviderWebhook(
      DepositProvider.VNPAY,
      payload,
    );
  }
}
