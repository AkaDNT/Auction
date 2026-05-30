import { Injectable } from '@nestjs/common';
import { WalletHoldStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  IWalletReconciliationRepository,
  WalletReconciliationResult,
} from './wallet-reconciliation.repository';

@Injectable()
export class WalletReconciliationPrismaRepository implements IWalletReconciliationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async reconcileWallet(walletId: string): Promise<WalletReconciliationResult> {
    const wallet = await this.prisma.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const activeHolds = await this.prisma.walletHold.findMany({
      where: {
        walletId,
        status: WalletHoldStatus.ACTIVE,
      },
      select: {
        amount: true,
      },
    });

    const expectedLockedBalance = activeHolds.reduce(
      (sum, hold) => sum.plus(hold.amount),
      new Decimal(0),
    );

    const lockedBalance = new Decimal(wallet.lockedBalance);

    return {
      walletId: wallet.id,
      userId: wallet.userId,
      balance: new Decimal(wallet.balance),
      lockedBalance,
      expectedLockedBalance,
      isConsistent: lockedBalance.equals(expectedLockedBalance),
    };
  }

  async findInconsistentWallets(params?: {
    limit?: number;
  }): Promise<WalletReconciliationResult[]> {
    const wallets = await this.prisma.wallet.findMany({
      take: params?.limit ?? 100,
      orderBy: { updatedAt: 'desc' },
    });

    const results: WalletReconciliationResult[] = [];

    for (const wallet of wallets) {
      const result = await this.reconcileWallet(wallet.id);

      if (!result.isConsistent) {
        results.push(result);
      }
    }

    return results;
  }
}
