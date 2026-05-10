import { Module } from '@nestjs/common';
import { WalletService } from './services/wallet.service';
import { WalletPrismaRepository } from './repositories/wallet.prisma.repository';
import { WALLET_REPOSITORY } from './repositories/wallet.repository';
import { WalletDepositController } from './controllers/wallet-deposit.controller';
import { DepositOrderService } from './services/deposit-order.service';
import { DEPOSIT_ORDER_REPOSITORY } from './repositories/deposit-order.repository';
import { DepositOrderPrismaRepository } from './repositories/deposit-order.prisma.repository';
import { WalletController } from './controllers/wallet.controller';
import { AdminWalletController } from './controllers/admin-wallet.controller';
import { WalletWithdrawalController } from './controllers/wallet-withdrawal.controller';
import { AdminWalletWithdrawalController } from './controllers/admin-wallet-withdrawal.controller';
import { WithdrawalRequestService } from './services/withdrawal-request.service';
import { WithdrawalRequestPrismaRepository } from './repositories/withdrawal-request.prisma.repository';
import { WalletHoldPrismaRepository } from './repositories/wallet-hold.prisma.repository';
import { WalletLedgerPrismaRepository } from './repositories/wallet-ledger.prisma.repository';
import { WITHDRAWAL_REQUEST_REPOSITORY } from './repositories/withdrawal-request.repository';
import { WALLET_HOLD_REPOSITORY } from './repositories/wallet-hold.repository';
import { WALLET_LEDGER_REPOSITORY } from './repositories/wallet-ledger.repository';
import { WITHDRAWAL_TRANSACTION_REPOSITORY } from './repositories/withdrawal-transaction.repository';
import { WithdrawalTransactionPrismaRepository } from './repositories/withdrawal-transaction.prisma.repository';
import { WalletWebhookController } from './controllers/wallet-webhook.controller';
import { DepositWebhookService } from './services/deposit-webhook.service';
import { DepositPrismaTransactionRepository } from './repositories/deposit-transaction.prisma.repository';
import { MomoPaymentGatewayService } from './infrastructure/momo-payment-gateway.service';
import { VnpayPaymentGatewayService } from './infrastructure/vnpay-payment-gateway.service';
import { DEPOSIT_TRANSACTION_REPOSITORY } from './repositories/deposit-transaction.repository';
import {
  MOMO_PAYMENT_GATEWAY,
  VNPAY_PAYMENT_GATEWAY,
} from './contracts/tokens';

@Module({
  controllers: [
    WalletController,
    AdminWalletController,
    WalletDepositController,
    WalletWithdrawalController,
    AdminWalletWithdrawalController,
    WalletWebhookController,
  ],
  providers: [
    WalletService,
    WalletPrismaRepository,

    DepositOrderService,
    DepositOrderPrismaRepository,
    DepositWebhookService,
    DepositPrismaTransactionRepository,

    WithdrawalRequestService,
    WithdrawalRequestPrismaRepository,
    WalletHoldPrismaRepository,
    WalletLedgerPrismaRepository,
    WithdrawalTransactionPrismaRepository,

    MomoPaymentGatewayService,
    VnpayPaymentGatewayService,
    {
      provide: WALLET_REPOSITORY,
      useExisting: WalletPrismaRepository,
    },
    {
      provide: DEPOSIT_ORDER_REPOSITORY,
      useExisting: DepositOrderPrismaRepository,
    },
    {
      provide: WITHDRAWAL_REQUEST_REPOSITORY,
      useExisting: WithdrawalRequestPrismaRepository,
    },
    {
      provide: WALLET_HOLD_REPOSITORY,
      useExisting: WalletHoldPrismaRepository,
    },
    {
      provide: WALLET_LEDGER_REPOSITORY,
      useExisting: WalletLedgerPrismaRepository,
    },
    {
      provide: WITHDRAWAL_TRANSACTION_REPOSITORY,
      useExisting: WithdrawalTransactionPrismaRepository,
    },
    {
      provide: DEPOSIT_TRANSACTION_REPOSITORY,
      useExisting: DepositPrismaTransactionRepository,
    },
    {
      provide: MOMO_PAYMENT_GATEWAY,
      useExisting: MomoPaymentGatewayService,
    },
    {
      provide: VNPAY_PAYMENT_GATEWAY,
      useExisting: VnpayPaymentGatewayService,
    },
  ],
  exports: [
    WalletService,
    DepositOrderService,
    WALLET_REPOSITORY,
    DEPOSIT_ORDER_REPOSITORY,
    WITHDRAWAL_REQUEST_REPOSITORY,
    WALLET_HOLD_REPOSITORY,
    WALLET_LEDGER_REPOSITORY,
    WITHDRAWAL_TRANSACTION_REPOSITORY,
  ],
})
export class WalletModule {}
