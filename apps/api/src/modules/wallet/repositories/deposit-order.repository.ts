import { DepositOrder, DepositStatus, Prisma } from '@prisma/client';

export const DEPOSIT_ORDER_REPOSITORY = Symbol('DEPOSIT_ORDER_REPOSITORY');

export interface IDepositOrderRepository {
  create(data: Prisma.DepositOrderCreateInput): Promise<DepositOrder>;

  findById(id: string): Promise<DepositOrder | null>;

  findByInternalCode(internalCode: string): Promise<DepositOrder | null>;

  findByProviderOrderId(providerOrderId: string): Promise<DepositOrder | null>;

  update(
    id: string,
    data: Prisma.DepositOrderUpdateInput,
  ): Promise<DepositOrder>;

  findManyByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<DepositOrder[]>;

  countByUser(userId: string): Promise<number>;

  findManyByStatus(status: DepositStatus): Promise<DepositOrder[]>;
}
