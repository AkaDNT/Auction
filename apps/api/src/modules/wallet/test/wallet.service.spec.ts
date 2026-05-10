import { Test, type TestingModule } from '@nestjs/testing';
import { ERROR_CODES } from '@repo/shared';
import { type AppException } from 'src/common/errors/app.exception';

import {
  type IWalletRepository,
  WALLET_REPOSITORY,
} from '../repositories/wallet.repository';
import { WalletService } from '../services/wallet.service';

describe('WalletService', () => {
  let service: WalletService;
  let walletRepository: jest.Mocked<IWalletRepository>;

  beforeEach(async () => {
    walletRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      bootstrapMissingWallets: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WALLET_REPOSITORY,
          useValue: walletRepository,
        },
      ],
    }).compile();

    service = module.get(WalletService);
  });

  it('returns the wallet with available balance', async () => {
    walletRepository.findByUserId.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      balance: '250000.50',
      lockedBalance: '100000.25',
    } as any);

    await expect(service.getMyWallet('user-1')).resolves.toMatchObject({
      id: 'wallet-1',
      userId: 'user-1',
      balance: '250000.50',
      lockedBalance: '100000.25',
      availableBalance: '150000.25',
    });

    expect(walletRepository.findByUserId).toHaveBeenCalledWith('user-1');
  });

  it('returns a negative available balance when wallet state is already over-locked', async () => {
    walletRepository.findByUserId.mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      balance: '1000',
      lockedBalance: '1500',
    } as any);

    await expect(service.getMyWallet('user-1')).resolves.toMatchObject({
      availableBalance: '-500',
    });
  });

  it('throws when the user has no wallet', async () => {
    walletRepository.findByUserId.mockResolvedValue(null);

    await expect(service.getMyWallet('missing-user')).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_NOT_FOUND,
      details: { userId: 'missing-user' },
    } satisfies Partial<AppException>);
  });

  it('bubbles repository failures', async () => {
    const error = new Error('database unavailable');
    walletRepository.findByUserId.mockRejectedValue(error);

    await expect(service.getMyWallet('user-1')).rejects.toBe(error);
  });

  it('delegates wallet bootstrap to the repository', async () => {
    const result = {
      totalUsers: 5,
      existingWalletUsers: 3,
      missingWalletUsers: 2,
      createdCount: 2,
    };
    walletRepository.bootstrapMissingWallets.mockResolvedValue(result);

    await expect(service.bootstrapMissingWallets()).resolves.toBe(result);
  });
});
