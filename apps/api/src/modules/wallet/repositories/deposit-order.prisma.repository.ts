import { Injectable } from '@nestjs/common';
import { DepositOrder, DepositStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IDepositOrderRepository } from './deposit-order.repository';

@Injectable()
export class DepositOrderPrismaRepository implements IDepositOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DepositOrderCreateInput): Promise<DepositOrder> {
    return this.prisma.depositOrder.create({
      data,
    });
  }

  findById(id: string): Promise<DepositOrder | null> {
    return this.prisma.depositOrder.findUnique({
      where: { id },
    });
  }

  findByInternalCode(internalCode: string): Promise<DepositOrder | null> {
    return this.prisma.depositOrder.findUnique({
      where: { internalCode },
    });
  }

  findByProviderOrderId(providerOrderId: string): Promise<DepositOrder | null> {
    return this.prisma.depositOrder.findUnique({
      where: { providerOrderId },
    });
  }

  update(
    id: string,
    data: Prisma.DepositOrderUpdateInput,
  ): Promise<DepositOrder> {
    return this.prisma.depositOrder.update({
      where: { id },
      data,
    });
  }

  findManyByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<DepositOrder[]> {
    return this.prisma.depositOrder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByUser(userId: string): Promise<number> {
    return this.prisma.depositOrder.count({
      where: { userId },
    });
  }

  findManyByStatus(status: DepositStatus): Promise<DepositOrder[]> {
    return this.prisma.depositOrder.findMany({
      where: { status },
      orderBy: { createdAt: 'asc' },
    });
  }
}
