import { Test, type TestingModule } from '@nestjs/testing';
import { WithdrawalStatus } from '@prisma/client';

import {
  type IWithdrawalRequestRepository,
  WITHDRAWAL_REQUEST_REPOSITORY,
} from '../repositories/withdrawal-request.repository';
import {
  type IWithdrawalTransactionRepository,
  WITHDRAWAL_TRANSACTION_REPOSITORY,
} from '../repositories/withdrawal-transaction.repository';
import { WithdrawalRequestService } from '../services/withdrawal-request.service';

describe('WithdrawalRequestService', () => {
  let service: WithdrawalRequestService;
  let withdrawalTransactionRepository: jest.Mocked<IWithdrawalTransactionRepository>;
  let withdrawalRequestRepository: jest.Mocked<IWithdrawalRequestRepository>;

  beforeEach(async () => {
    withdrawalTransactionRepository = {
      createRequest: jest.fn(),
      completeRequest: jest.fn(),
      rejectRequest: jest.fn(),
    };
    withdrawalRequestRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByInternalCode: jest.fn(),
      update: jest.fn(),
      findManyByUser: jest.fn(),
      countByUser: jest.fn(),
      findManyByStatus: jest.fn(),
      countByStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WithdrawalRequestService,
        {
          provide: WITHDRAWAL_TRANSACTION_REPOSITORY,
          useValue: withdrawalTransactionRepository,
        },
        {
          provide: WITHDRAWAL_REQUEST_REPOSITORY,
          useValue: withdrawalRequestRepository,
        },
      ],
    }).compile();

    service = module.get(WithdrawalRequestService);
  });

  it('delegates withdrawal creation to the transaction repository', async () => {
    const dto = {
      amount: 100000,
      bankAccountNo: '123456789',
      bankAccountName: 'Nguyen Van A',
    };
    const request = { id: 'withdrawal-1' } as any;
    withdrawalTransactionRepository.createRequest.mockResolvedValue(request);

    await expect(service.create('user-1', dto)).resolves.toBe(request);

    expect(withdrawalTransactionRepository.createRequest).toHaveBeenCalledWith(
      'user-1',
      dto,
    );
  });

  it('returns paginated withdrawal requests for the current user', async () => {
    const requests = [{ id: 'withdrawal-1' }] as any;
    withdrawalRequestRepository.findManyByUser.mockResolvedValue(requests);
    withdrawalRequestRepository.countByUser.mockResolvedValue(3);

    await expect(service.findMyRequests('user-1', 2, 10)).resolves.toEqual({
      items: requests,
      meta: {
        page: 2,
        limit: 10,
        total: 3,
      },
    });
  });

  it('uses default pagination for my withdrawal requests', async () => {
    withdrawalRequestRepository.findManyByUser.mockResolvedValue([]);
    withdrawalRequestRepository.countByUser.mockResolvedValue(0);

    await expect(service.findMyRequests('user-1')).resolves.toEqual({
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
      },
    });
    expect(withdrawalRequestRepository.findManyByUser).toHaveBeenCalledWith(
      'user-1',
      1,
      20,
    );
  });

  it('returns paginated pending requests for admins', async () => {
    const requests = [{ id: 'withdrawal-1' }] as any;
    withdrawalRequestRepository.findManyByStatus.mockResolvedValue(requests);
    withdrawalRequestRepository.countByStatus.mockResolvedValue(4);

    await expect(service.findPending(3, 20)).resolves.toEqual({
      items: requests,
      meta: {
        page: 3,
        limit: 20,
        total: 4,
      },
    });
    expect(withdrawalRequestRepository.findManyByStatus).toHaveBeenCalledWith(
      WithdrawalStatus.PENDING,
      3,
      20,
    );
    expect(withdrawalRequestRepository.countByStatus).toHaveBeenCalledWith(
      WithdrawalStatus.PENDING,
    );
  });

  it('uses default pagination for pending requests', async () => {
    withdrawalRequestRepository.findManyByStatus.mockResolvedValue([]);
    withdrawalRequestRepository.countByStatus.mockResolvedValue(0);

    await expect(service.findPending()).resolves.toEqual({
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
      },
    });
    expect(withdrawalRequestRepository.findManyByStatus).toHaveBeenCalledWith(
      WithdrawalStatus.PENDING,
      1,
      20,
    );
  });

  it('delegates completion and rejection to the transaction repository', async () => {
    withdrawalTransactionRepository.completeRequest.mockResolvedValue({
      id: 'withdrawal-1',
      status: WithdrawalStatus.COMPLETED,
    } as any);
    withdrawalTransactionRepository.rejectRequest.mockResolvedValue({
      id: 'withdrawal-2',
      status: WithdrawalStatus.REJECTED,
    } as any);

    await expect(service.complete('withdrawal-1')).resolves.toMatchObject({
      status: WithdrawalStatus.COMPLETED,
    });
    await expect(
      service.reject('withdrawal-2', 'Invalid account'),
    ).resolves.toMatchObject({
      status: WithdrawalStatus.REJECTED,
    });

    expect(
      withdrawalTransactionRepository.completeRequest,
    ).toHaveBeenCalledWith('withdrawal-1');
    expect(withdrawalTransactionRepository.rejectRequest).toHaveBeenCalledWith(
      'withdrawal-2',
      'Invalid account',
    );
  });

  it('bubbles transaction repository failures', async () => {
    const error = new Error('transaction failed');
    withdrawalTransactionRepository.createRequest.mockRejectedValue(error);

    await expect(
      service.create('user-1', {
        amount: 100000,
        bankAccountNo: '123456789',
        bankAccountName: 'Nguyen Van A',
      }),
    ).rejects.toBe(error);
  });
});
