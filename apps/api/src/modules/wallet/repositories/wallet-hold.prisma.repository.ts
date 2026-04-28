import { Injectable } from '@nestjs/common';
import {
  Prisma,
  WalletHold,
  WalletHoldStatus,
  WalletHoldType,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IWalletHoldRepository } from './wallet-hold.repository';

@Injectable()
export class WalletHoldPrismaRepository implements IWalletHoldRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.WalletHoldCreateInput): Promise<WalletHold> {
    return this.prisma.walletHold.create({ data });
  }

  findById(id: string): Promise<WalletHold | null> {
    return this.prisma.walletHold.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.WalletHoldUpdateInput): Promise<WalletHold> {
    return this.prisma.walletHold.update({
      where: { id },
      data,
    });
  }

  findActiveByReference(params: {
    walletId?: string;
    userId?: string;
    referenceType: string;
    referenceId: string;
    type?: WalletHoldType;
  }): Promise<WalletHold | null> {
    return this.prisma.walletHold.findFirst({
      where: {
        walletId: params.walletId,
        userId: params.userId,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        type: params.type,
        status: WalletHoldStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findManyByWalletAndStatus(
    walletId: string,
    status: WalletHoldStatus,
  ): Promise<WalletHold[]> {
    return this.prisma.walletHold.findMany({
      where: { walletId, status },
      orderBy: { createdAt: 'desc' },
    });
  }
}
