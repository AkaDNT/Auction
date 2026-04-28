import {
  Prisma,
  WalletHold,
  WalletHoldStatus,
  WalletHoldType,
} from '@prisma/client';

export const WALLET_HOLD_REPOSITORY = Symbol('WALLET_HOLD_REPOSITORY');

export interface IWalletHoldRepository {
  create(data: Prisma.WalletHoldCreateInput): Promise<WalletHold>;

  findById(id: string): Promise<WalletHold | null>;

  update(id: string, data: Prisma.WalletHoldUpdateInput): Promise<WalletHold>;

  findActiveByReference(params: {
    walletId?: string;
    userId?: string;
    referenceType: string;
    referenceId: string;
    type?: WalletHoldType;
  }): Promise<WalletHold | null>;

  findManyByWalletAndStatus(
    walletId: string,
    status: WalletHoldStatus,
  ): Promise<WalletHold[]>;
}
