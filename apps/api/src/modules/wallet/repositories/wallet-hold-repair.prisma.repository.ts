import { Injectable } from '@nestjs/common';
import { WalletHold } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { IWalletHoldRepairRepository } from './wallet-hold-repair.repository';

@Injectable()
export class WalletHoldRepairPrismaRepository implements IWalletHoldRepairRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStaleBidHolds(params?: { limit?: number }): Promise<WalletHold[]> {
    const limit = params?.limit ?? 100;

    return this.prisma.$queryRaw<WalletHold[]>`
    SELECT wh.*
    FROM "WalletHold" wh
    JOIN "Auction" a ON a.id = wh."referenceId"
    WHERE wh.type = 'BID'
      AND wh.status = 'ACTIVE'
      AND wh."referenceType" = 'AUCTION'
      AND a.status IN ('ENDED', 'CANCELLED')
    ORDER BY wh."updatedAt" ASC
    LIMIT ${limit}
  `;
  }
}
