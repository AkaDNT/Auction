import { Inject, Injectable } from '@nestjs/common';
import { CreateWithdrawalRequestDto } from '../dto/create-withdrawal-request.dto';
import * as withdrawalTransactionRepository from '../repositories/withdrawal-transaction.repository';
import * as withdrawalRequestRepository from '../repositories/withdrawal-request.repository';
import { WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalRequestService {
  constructor(
    @Inject(withdrawalTransactionRepository.WITHDRAWAL_TRANSACTION_REPOSITORY)
    private readonly withdrawalTransactionRepository: withdrawalTransactionRepository.IWithdrawalTransactionRepository,
    @Inject(withdrawalRequestRepository.WITHDRAWAL_REQUEST_REPOSITORY)
    private readonly withdrawalRequestRepository: withdrawalRequestRepository.IWithdrawalRequestRepository,
  ) {}

  create(userId: string, dto: CreateWithdrawalRequestDto) {
    return this.withdrawalTransactionRepository.createRequest(userId, dto);
  }

  async findMyRequests(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.withdrawalRequestRepository.findManyByUser(userId, page, limit),
      this.withdrawalRequestRepository.countByUser(userId),
    ]);

    return {
      items,
      meta: { page, limit, total },
    };
  }

  async findPending(page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.withdrawalRequestRepository.findManyByStatus(
        WithdrawalStatus.PENDING,
        page,
        limit,
      ),
      this.withdrawalRequestRepository.countByStatus(WithdrawalStatus.PENDING),
    ]);

    return {
      items,
      meta: { page, limit, total },
    };
  }

  complete(id: string) {
    return this.withdrawalTransactionRepository.completeRequest(id);
  }

  reject(id: string, reason: string) {
    return this.withdrawalTransactionRepository.rejectRequest(id, reason);
  }
}
