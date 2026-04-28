import { Injectable } from '@nestjs/common';
import { Prisma, WalletLedgerEntry } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IWalletLedgerRepository } from './wallet-ledger.repository';

@Injectable()
export class WalletLedgerPrismaRepository implements IWalletLedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.WalletLedgerEntryCreateInput,
  ): Promise<WalletLedgerEntry> {
    return this.prisma.walletLedgerEntry.create({ data });
  }

  findManyByWallet(
    walletId: string,
    page: number,
    limit: number,
  ): Promise<WalletLedgerEntry[]> {
    return this.prisma.walletLedgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByWallet(walletId: string): Promise<number> {
    return this.prisma.walletLedgerEntry.count({
      where: { walletId },
    });
  }
}
