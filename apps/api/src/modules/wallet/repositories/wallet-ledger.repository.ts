import { Prisma, WalletLedgerEntry } from '@prisma/client';

export const WALLET_LEDGER_REPOSITORY = Symbol('WALLET_LEDGER_REPOSITORY');

export interface IWalletLedgerRepository {
  create(data: Prisma.WalletLedgerEntryCreateInput): Promise<WalletLedgerEntry>;

  findManyByWallet(
    walletId: string,
    page: number,
    limit: number,
  ): Promise<WalletLedgerEntry[]>;

  countByWallet(walletId: string): Promise<number>;
}
