import { Injectable } from '@nestjs/common';
import { Prisma, Wallet } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IWalletRepository } from './wallet.repository';

@Injectable()
export class WalletPrismaRepository implements IWalletRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { id },
    });
  }

  findByUserId(userId: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({
      where: { userId },
    });
  }

  create(data: Prisma.WalletCreateInput): Promise<Wallet> {
    return this.prisma.wallet.create({
      data,
    });
  }

  update(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { id },
      data,
    });
  }

  async bootstrapMissingWallets(): Promise<{
    totalUsers: number;
    existingWalletUsers: number;
    missingWalletUsers: number;
    createdCount: number;
  }> {
    const [users, wallets] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true },
      }),
      this.prisma.wallet.findMany({
        select: { userId: true },
      }),
    ]);

    const walletUserIdSet = new Set(wallets.map((wallet) => wallet.userId));

    const missingUserIds = users
      .map((user) => user.id)
      .filter((userId) => !walletUserIdSet.has(userId));

    let createdCount = 0;

    if (missingUserIds.length > 0) {
      const result = await this.prisma.wallet.createMany({
        data: missingUserIds.map((userId) => ({
          userId,
        })),
        skipDuplicates: true,
      });

      createdCount = result.count;
    }

    return {
      totalUsers: users.length,
      existingWalletUsers: walletUserIdSet.size,
      missingWalletUsers: missingUserIds.length,
      createdCount,
    };
  }
}
