import { Inject, Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import * as walletRepository from '../repositories/wallet.repository';

@Injectable()
export class WalletService {
  constructor(
    @Inject(walletRepository.WALLET_REPOSITORY)
    private readonly walletRepository: walletRepository.IWalletRepository,
  ) {}

  async getOrCreateWallet(userId: string) {
    return this.walletRepository.upsertByUserId(userId);
  }

  async getMyWallet(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const availableBalance = new Decimal(wallet.balance)
      .minus(wallet.lockedBalance)
      .toString();

    return {
      ...wallet,
      availableBalance,
    };
  }
}
