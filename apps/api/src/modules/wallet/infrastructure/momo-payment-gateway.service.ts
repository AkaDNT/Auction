import { Injectable } from '@nestjs/common';
import {
  CreateDepositPaymentParams,
  CreateDepositPaymentResult,
  IPaymentGatewayPort,
  VerifyWebhookResult,
} from '../contracts/payment-gateway.port';

@Injectable()
export class MomoPaymentGatewayService implements IPaymentGatewayPort {
  async createDepositPayment(
    params: CreateDepositPaymentParams,
  ): Promise<CreateDepositPaymentResult> {
    return {
      providerOrderId: `MOMO_${params.internalCode}`,
      paymentUrl: `https://momo.test/pay/${params.internalCode}`,
      qrContent: `MOMO|${params.internalCode}|${params.amount}`,
      rawPayload: {
        provider: 'MOMO',
        internalCode: params.internalCode,
      },
    };
  }

  async verifyDepositWebhook(payload: any): Promise<VerifyWebhookResult> {
    return {
      success: payload?.resultCode === 0,
      providerOrderId: payload?.orderId,
      providerTransactionId: payload?.transId,
      rawPayload: payload,
    };
  }
}
