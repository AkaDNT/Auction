import { type WalletHold } from '@prisma/client';

export const WALLET_HOLD_REPAIR_REPOSITORY = Symbol(
  'WALLET_HOLD_REPAIR_REPOSITORY',
);

export interface IWalletHoldRepairRepository {
  findStaleBidHolds(params?: { limit?: number }): Promise<WalletHold[]>;
}
