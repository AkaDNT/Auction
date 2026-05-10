import { DepositOrder } from '@prisma/client';

export const DEPOSIT_TRANSACTION_REPOSITORY = Symbol(
  'DEPOSIT_TRANSACTION_REPOSITORY',
);

export interface IDepositTransactionRepository {
  markPaidAndCreditWallet(params: {
    providerOrderId: string;
    providerTransactionId?: string;
    rawPayload?: unknown;
  }): Promise<DepositOrder>;
}
