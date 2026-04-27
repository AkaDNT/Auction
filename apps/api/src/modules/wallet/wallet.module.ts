import { Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletPrismaRepository } from './repositories/wallet.prisma.repository';
import { WALLET_REPOSITORY } from './repositories/wallet.repository';
import { WalletDepositController } from './controllers/wallet-deposit.controller';
import { DepositOrderService } from './services/deposit-order.service';
import { DEPOSIT_ORDER_REPOSITORY } from './repositories/deposit-order.repository';
import { DepositOrderPrismaRepository } from './repositories/deposit-order.prisma.repository';
import { WalletController } from './controllers/wallet.controller';

@Module({
  controllers: [WalletController, WalletDepositController],
  providers: [
    WalletService,
    WalletPrismaRepository,
    DepositOrderService,
    DepositOrderPrismaRepository,
    {
      provide: WALLET_REPOSITORY,
      useExisting: WalletPrismaRepository,
    },
    {
      provide: DEPOSIT_ORDER_REPOSITORY,
      useExisting: DepositOrderPrismaRepository,
    },
  ],
  exports: [
    WalletService,
    DepositOrderService,
    WALLET_REPOSITORY,
    DEPOSIT_ORDER_REPOSITORY,
  ],
})
export class WalletModule {}
