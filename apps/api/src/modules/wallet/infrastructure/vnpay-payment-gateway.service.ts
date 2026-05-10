import { Injectable } from '@nestjs/common';
import {
  CreateDepositPaymentParams,
  CreateDepositPaymentResult,
  IPaymentGatewayPort,
  VerifyWebhookResult,
} from '../contracts/payment-gateway.port';

@Injectable()
export class VnpayPaymentGatewayService implements IPaymentGatewayPort {
  async createDepositPayment(
    params: CreateDepositPaymentParams,
  ): Promise<CreateDepositPaymentResult> {
    return {
      providerOrderId: `VNPAY_${params.internalCode}`,
      paymentUrl: `https://vnpay.test/pay/${params.internalCode}`,
      qrContent: `VNPAY|${params.internalCode}|${params.amount}`,
      rawPayload: {
        provider: 'VNPAY',
        internalCode: params.internalCode,
      },
    };
  }

  async verifyDepositWebhook(payload: any): Promise<VerifyWebhookResult> {
    return {
      success: payload?.vnp_ResponseCode === '00',
      providerOrderId: payload?.vnp_TxnRef,
      providerTransactionId: payload?.vnp_TransactionNo,
      rawPayload: payload,
    };
  }
}
