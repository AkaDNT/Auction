import { DepositProvider } from '@prisma/client';

export const PAYMENT_GATEWAY_PORT = Symbol('PAYMENT_GATEWAY_PORT');

export type CreateDepositPaymentParams = {
  provider: DepositProvider;
  internalCode: string;
  amount: number;
  description?: string;
  returnUrl?: string;
  notifyUrl?: string;
};

export type CreateDepositPaymentResult = {
  providerOrderId: string;
  paymentUrl?: string;
  qrContent?: string;
  rawPayload?: unknown;
};

export type VerifyWebhookResult = {
  success: boolean;
  providerOrderId: string;
  providerTransactionId?: string;
  rawPayload?: unknown;
};

export interface IPaymentGatewayPort {
  createDepositPayment(
    params: CreateDepositPaymentParams,
  ): Promise<CreateDepositPaymentResult>;

  verifyDepositWebhook(payload: unknown): Promise<VerifyWebhookResult>;
}
