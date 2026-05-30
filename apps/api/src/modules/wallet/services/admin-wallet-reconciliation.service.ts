import { Inject, Injectable } from '@nestjs/common';

import * as walletReconciliationRepository from '../repositories/wallet-reconciliation.repository';

@Injectable()
export class WalletReconciliationService {
  constructor(
    @Inject(walletReconciliationRepository.WALLET_RECONCILIATION_REPOSITORY)
    private readonly walletReconciliationRepository: walletReconciliationRepository.IWalletReconciliationRepository,
  ) {}

  reconcileWallet(walletId: string) {
    return this.walletReconciliationRepository.reconcileWallet(walletId);
  }

  findInconsistentWallets(limit = 100) {
    return this.walletReconciliationRepository.findInconsistentWallets({
      limit,
    });
  }
}
