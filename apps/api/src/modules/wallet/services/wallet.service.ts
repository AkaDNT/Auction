import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import * as walletRepository from '../repositories/wallet.repository';
import { AppException } from 'src/common/errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Injectable()
export class WalletService {
  constructor(
    @Inject(walletRepository.WALLET_REPOSITORY)
    private readonly walletRepository: walletRepository.IWalletRepository,
  ) {}

  async getMyWallet(userId: string) {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppException(
        {
          code: ERROR_CODES.WALLET_NOT_FOUND,
          message: 'Không tìm thấy ví',
          details: { userId },
        },
        404,
      );
    }

    const availableBalance = new Decimal(wallet.balance)
      .minus(wallet.lockedBalance)
      .toString();

    return {
      ...wallet,
      availableBalance,
    };
  }

  async bootstrapMissingWallets() {
    return this.walletRepository.bootstrapMissingWallets();
  }
}
