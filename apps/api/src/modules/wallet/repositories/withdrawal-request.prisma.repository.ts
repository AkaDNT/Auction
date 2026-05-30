import { Injectable } from '@nestjs/common';
import { Prisma, WithdrawalRequest, WithdrawalStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { IWithdrawalRequestRepository } from './withdrawal-request.repository';

@Injectable()
export class WithdrawalRequestPrismaRepository implements IWithdrawalRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.WithdrawalRequestCreateInput,
  ): Promise<WithdrawalRequest> {
    return this.prisma.withdrawalRequest.create({ data });
  }

  findById(id: string): Promise<WithdrawalRequest | null> {
    return this.prisma.withdrawalRequest.findUnique({
      where: { id },
    });
  }

  findByInternalCode(internalCode: string): Promise<WithdrawalRequest | null> {
    return this.prisma.withdrawalRequest.findUnique({
      where: { internalCode },
    });
  }

  update(
    id: string,
    data: Prisma.WithdrawalRequestUpdateInput,
  ): Promise<WithdrawalRequest> {
    return this.prisma.withdrawalRequest.update({
      where: { id },
      data,
    });
  }

  findManyByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<WithdrawalRequest[]> {
    return this.prisma.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByUser(userId: string): Promise<number> {
    return this.prisma.withdrawalRequest.count({
      where: { userId },
    });
  }

  findManyByStatus(
    status: WithdrawalStatus,
    page: number,
    limit: number,
  ): Promise<WithdrawalRequest[]> {
    return this.prisma.withdrawalRequest.findMany({
      where: { status },
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  countByStatus(status: WithdrawalStatus): Promise<number> {
    return this.prisma.withdrawalRequest.count({
      where: { status },
    });
  }
}
