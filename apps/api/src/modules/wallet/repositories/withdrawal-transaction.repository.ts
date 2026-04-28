import { WithdrawalRequest } from '@prisma/client';
import { CreateWithdrawalRequestDto } from '../dto/create-withdrawal-request.dto';

export const WITHDRAWAL_TRANSACTION_REPOSITORY = Symbol(
  'WITHDRAWAL_TRANSACTION_REPOSITORY',
);

export interface IWithdrawalTransactionRepository {
  createRequest(
    userId: string,
    dto: CreateWithdrawalRequestDto,
  ): Promise<WithdrawalRequest>;

  completeRequest(id: string): Promise<WithdrawalRequest>;

  rejectRequest(id: string, reason: string): Promise<WithdrawalRequest>;
}
