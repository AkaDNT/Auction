import { Prisma, Wallet } from '@repo/db';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');
export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  create(data: Prisma.WalletCreateInput): Promise<Wallet>;
  update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet>;
  upsertByUserId(userId: string): Promise<Wallet>;
}
