import { Injectable } from '@nestjs/common';
import {
  DepositStatus,
  Prisma,
  WalletLedgerDirection,
  WalletLedgerType,
} from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import { IDepositTransactionRepository } from './deposit-transaction.repository';
import { AppException } from 'src/common/errors/app.exception';

@Injectable()
export class DepositPrismaTransactionRepository implements IDepositTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private payableStatuses: DepositStatus[] = [
    DepositStatus.PENDING,
    DepositStatus.PROCESSING,
  ];

  async markPaidAndCreditWallet(params: {
    providerOrderId: string;
    providerTransactionId?: string;
    rawPayload?: unknown;
  }) {
    return this.prisma.$transaction(
      async (tx) => {
        const order = await tx.depositOrder.findUnique({
          where: { providerOrderId: params.providerOrderId },
        });

        if (!order) {
          throw new AppException(
            {
              code: ERROR_CODES.DEPOSIT_ORDER_NOT_FOUND,
              message: 'Không tìm thấy lệnh nạp tiền',
              details: {
                providerOrderId: params.providerOrderId,
              },
            },
            404,
          );
        }

        if (order.status === DepositStatus.PAID) {
          return order;
        }

        if (!this.payableStatuses.includes(order.status)) {
          throw new AppException(
            {
              code: ERROR_CODES.DEPOSIT_ORDER_INVALID_STATUS,
              message:
                'Trạng thái lệnh nạp không hợp lệ để xác nhận thanh toán',
              details: {
                orderId: order.id,
                status: order.status,
              },
            },
            400,
          );
        }

        const markPaidResult = await tx.depositOrder.updateMany({
          where: {
            id: order.id,
            status: {
              in: this.payableStatuses,
            },
          },
          data: {
            status: DepositStatus.PAID,
            paidAt: new Date(),
            providerTxnId: params.providerTransactionId ?? undefined,
            rawPayload: params.rawPayload as Prisma.InputJsonValue,
          },
        });

        if (markPaidResult.count === 0) {
          return tx.depositOrder.findUniqueOrThrow({
            where: { id: order.id },
          });
        }

        const updatedWallet = await tx.wallet.update({
          where: { id: order.walletId },
          data: {
            balance: {
              increment: order.amount,
            },
          },
        });

        await tx.walletLedgerEntry.create({
          data: {
            wallet: {
              connect: { id: updatedWallet.id },
            },
            user: {
              connect: { id: order.userId },
            },
            direction: WalletLedgerDirection.CREDIT,
            type: WalletLedgerType.DEPOSIT_SETTLED,
            amount: order.amount,
            balanceAfter: updatedWallet.balance,
            lockedAfter: updatedWallet.lockedBalance,
            referenceType: 'DEPOSIT_ORDER',
            referenceId: order.id,
            idempotencyKey: `DEPOSIT_SETTLED_${order.id}`,
            note: 'Deposit settled successfully',
          },
        });

        return tx.depositOrder.findUniqueOrThrow({
          where: { id: order.id },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
