import { Inject, Injectable } from '@nestjs/common';

import * as walletHoldRepairRepository from '../repositories/wallet-hold-repair.repository';

@Injectable()
export class WalletHoldRepairService {
  constructor(
    @Inject(walletHoldRepairRepository.WALLET_HOLD_REPAIR_REPOSITORY)
    private readonly walletHoldRepairRepository: walletHoldRepairRepository.IWalletHoldRepairRepository,
  ) {}

  findStaleBidHolds(limit: number) {
    return this.walletHoldRepairRepository.findStaleBidHolds({ limit });
  }
}
