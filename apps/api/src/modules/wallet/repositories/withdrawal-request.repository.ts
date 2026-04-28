import { Prisma, WithdrawalRequest, WithdrawalStatus } from '@prisma/client';

export const WITHDRAWAL_REQUEST_REPOSITORY = Symbol(
  'WITHDRAWAL_REQUEST_REPOSITORY',
);

export interface IWithdrawalRequestRepository {
  create(data: Prisma.WithdrawalRequestCreateInput): Promise<WithdrawalRequest>;

  findById(id: string): Promise<WithdrawalRequest | null>;

  findByInternalCode(internalCode: string): Promise<WithdrawalRequest | null>;

  update(
    id: string,
    data: Prisma.WithdrawalRequestUpdateInput,
  ): Promise<WithdrawalRequest>;

  findManyByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<WithdrawalRequest[]>;

  countByUser(userId: string): Promise<number>;

  findManyByStatus(
    status: WithdrawalStatus,
    page: number,
    limit: number,
  ): Promise<WithdrawalRequest[]>;

  countByStatus(status: WithdrawalStatus): Promise<number>;
}
