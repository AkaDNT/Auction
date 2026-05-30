import { type Decimal } from '@prisma/client/runtime/library';

export const WALLET_RECONCILIATION_REPOSITORY = Symbol(
  'WALLET_RECONCILIATION_REPOSITORY',
);

export type WalletReconciliationResult = {
  walletId: string;
  userId: string;
  balance: Decimal;
  lockedBalance: Decimal;
  expectedLockedBalance: Decimal;
  isConsistent: boolean;
};

export interface IWalletReconciliationRepository {
  reconcileWallet(walletId: string): Promise<WalletReconciliationResult>;

  findInconsistentWallets(params?: {
    limit?: number;
  }): Promise<WalletReconciliationResult[]>;
}
