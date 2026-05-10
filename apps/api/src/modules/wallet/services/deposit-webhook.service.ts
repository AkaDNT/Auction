import { Inject, Injectable } from '@nestjs/common';
import { DepositProvider } from '@prisma/client';
import {
  MOMO_PAYMENT_GATEWAY,
  VNPAY_PAYMENT_GATEWAY,
} from '../contracts/tokens';
import * as paymentGatewayPort from '../contracts/payment-gateway.port';
import * as depositTransactionRepository_1 from '../repositories/deposit-transaction.repository';

@Injectable()
export class DepositWebhookService {
  constructor(
    @Inject(MOMO_PAYMENT_GATEWAY)
    private readonly momoGateway: paymentGatewayPort.IPaymentGatewayPort,
    @Inject(VNPAY_PAYMENT_GATEWAY)
    private readonly vnpayGateway: paymentGatewayPort.IPaymentGatewayPort,
    @Inject(depositTransactionRepository_1.DEPOSIT_TRANSACTION_REPOSITORY)
    private readonly depositTransactionRepository: depositTransactionRepository_1.IDepositTransactionRepository,
  ) {}

  async handleProviderWebhook(provider: DepositProvider, payload: unknown) {
    const gateway = this.resolveGateway(provider);
    const verified = await gateway.verifyDepositWebhook(payload);

    if (!verified.success) {
      return {
        success: false,
      };
    }

    const order =
      await this.depositTransactionRepository.markPaidAndCreditWallet({
        providerOrderId: verified.providerOrderId,
        providerTransactionId: verified.providerTransactionId,
        rawPayload: verified.rawPayload,
      });

    return {
      success: true,
      depositOrderId: order.id,
    };
  }

  private resolveGateway(
    provider: DepositProvider,
  ): paymentGatewayPort.IPaymentGatewayPort {
    switch (provider) {
      case DepositProvider.MOMO:
        return this.momoGateway;
      case DepositProvider.VNPAY:
        return this.vnpayGateway;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
