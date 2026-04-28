import { Injectable } from '@nestjs/common';
import {
  Prisma,
  WalletHoldStatus,
  WalletHoldType,
  WalletLedgerDirection,
  WalletLedgerType,
  WithdrawalRequest,
  WithdrawalStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ERROR_CODES } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';
import { IWithdrawalTransactionRepository } from './withdrawal-transaction.repository';
import { CreateWithdrawalRequestDto } from '../dto/create-withdrawal-request.dto';
import { AppException } from 'src/common/errors/app.exception';

@Injectable()
export class WithdrawalTransactionPrismaRepository implements IWithdrawalTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly allowedStatuses: WithdrawalStatus[] = [
    WithdrawalStatus.PENDING,
    WithdrawalStatus.APPROVED,
    WithdrawalStatus.PROCESSING,
  ];

  async createRequest(
    userId: string,
    dto: CreateWithdrawalRequestDto,
  ): Promise<WithdrawalRequest> {
    return this.prisma.$transaction(
      async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { userId },
        });

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

        const availableBalance = new Decimal(wallet.balance).minus(
          wallet.lockedBalance,
        );

        if (availableBalance.lessThan(dto.amount)) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_INSUFFICIENT_AVAILABLE_BALANCE,
              message: 'Số dư khả dụng không đủ để rút',
              details: {
                amount: dto.amount,
                availableBalance: availableBalance.toString(),
              },
            },
            400,
          );
        }

        const internalCode = this.generateInternalCode();

        const request = await tx.withdrawalRequest.create({
          data: {
            user: {
              connect: { id: userId },
            },
            wallet: {
              connect: { id: wallet.id },
            },
            amount: dto.amount,
            status: WithdrawalStatus.PENDING,
            bankCode: dto.bankCode,
            bankName: dto.bankName,
            bankAccountNo: dto.bankAccountNo,
            bankAccountName: dto.bankAccountName,
            note: dto.note,
            internalCode,
          },
        });

        const nextLockedBalance = new Decimal(wallet.lockedBalance).plus(
          dto.amount,
        );

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            lockedBalance: nextLockedBalance,
          },
        });

        await tx.walletHold.create({
          data: {
            wallet: {
              connect: { id: wallet.id },
            },
            user: {
              connect: { id: userId },
            },
            type: WalletHoldType.WITHDRAWAL,
            status: WalletHoldStatus.ACTIVE,
            amount: dto.amount,
            referenceType: 'WITHDRAWAL_REQUEST',
            referenceId: request.id,
            reason: 'User requested withdrawal',
          },
        });

        return request;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async completeRequest(id: string): Promise<WithdrawalRequest> {
    return this.prisma.$transaction(
      async (tx) => {
        const request = await tx.withdrawalRequest.findUnique({
          where: { id },
        });

        if (!request) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_NOT_FOUND,
              message: 'Không tìm thấy yêu cầu rút tiền',
              details: { id },
            },
            404,
          );
        }

        if (!this.allowedStatuses.includes(request.status)) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_INVALID_STATUS,
              message: 'Trạng thái yêu cầu rút không hợp lệ',
              details: { id, status: request.status },
            },
            400,
          );
        }

        const wallet = await tx.wallet.findUnique({
          where: { id: request.walletId },
        });

        if (!wallet) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_NOT_FOUND,
              message: 'Không tìm thấy ví',
              details: { walletId: request.walletId },
            },
            404,
          );
        }

        const hold = await tx.walletHold.findFirst({
          where: {
            walletId: wallet.id,
            userId: request.userId,
            referenceType: 'WITHDRAWAL_REQUEST',
            referenceId: request.id,
            type: WalletHoldType.WITHDRAWAL,
            status: WalletHoldStatus.ACTIVE,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!hold) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
              message:
                'Không tìm thấy khoản hold đang hoạt động cho yêu cầu rút',
              details: { withdrawalRequestId: request.id },
            },
            404,
          );
        }

        const nextBalance = new Decimal(wallet.balance).minus(request.amount);
        const nextLockedBalance = new Decimal(wallet.lockedBalance).minus(
          request.amount,
        );

        if (nextBalance.lessThan(0) || nextLockedBalance.lessThan(0)) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_INVALID_STATE,
              message: 'Trạng thái ví không hợp lệ',
              details: {
                walletId: wallet.id,
                balance: wallet.balance.toString(),
                lockedBalance: wallet.lockedBalance.toString(),
                amount: request.amount.toString(),
              },
            },
            409,
          );
        }

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: nextBalance,
            lockedBalance: nextLockedBalance,
          },
        });

        await tx.walletHold.update({
          where: { id: hold.id },
          data: {
            status: WalletHoldStatus.CAPTURED,
            capturedAt: new Date(),
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: request.id },
          data: {
            status: WithdrawalStatus.COMPLETED,
            processedAt: new Date(),
            completedAt: new Date(),
          },
        });

        await tx.walletLedgerEntry.create({
          data: {
            wallet: {
              connect: { id: wallet.id },
            },
            user: {
              connect: { id: request.userId },
            },
            direction: WalletLedgerDirection.DEBIT,
            type: WalletLedgerType.WITHDRAWAL_COMPLETED,
            amount: request.amount,
            balanceAfter: nextBalance,
            lockedAfter: nextLockedBalance,
            referenceType: 'WITHDRAWAL_REQUEST',
            referenceId: request.id,
            idempotencyKey: `WITHDRAWAL_COMPLETED_${request.id}`,
            note: 'Withdrawal completed successfully',
          },
        });

        const updated = await tx.withdrawalRequest.findUnique({
          where: { id: request.id },
        });

        if (!updated) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_NOT_FOUND,
              message: 'Không tìm thấy yêu cầu rút sau khi cập nhật',
              details: { id: request.id },
            },
            404,
          );
        }

        return updated;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async rejectRequest(id: string, reason: string): Promise<WithdrawalRequest> {
    return this.prisma.$transaction(
      async (tx) => {
        const request = await tx.withdrawalRequest.findUnique({
          where: { id },
        });

        if (!request) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_NOT_FOUND,
              message: 'Không tìm thấy yêu cầu rút tiền',
              details: { id },
            },
            404,
          );
        }

        if (!this.allowedStatuses.includes(request.status)) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_INVALID_STATUS,
              message: 'Trạng thái yêu cầu rút không hợp lệ',
              details: { id, status: request.status },
            },
            400,
          );
        }

        const wallet = await tx.wallet.findUnique({
          where: { id: request.walletId },
        });

        if (!wallet) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_NOT_FOUND,
              message: 'Không tìm thấy ví',
              details: { walletId: request.walletId },
            },
            404,
          );
        }

        const hold = await tx.walletHold.findFirst({
          where: {
            walletId: wallet.id,
            userId: request.userId,
            referenceType: 'WITHDRAWAL_REQUEST',
            referenceId: request.id,
            type: WalletHoldType.WITHDRAWAL,
            status: WalletHoldStatus.ACTIVE,
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!hold) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
              message:
                'Không tìm thấy khoản hold đang hoạt động cho yêu cầu rút',
              details: { withdrawalRequestId: request.id },
            },
            404,
          );
        }

        const nextLockedBalance = new Decimal(wallet.lockedBalance).minus(
          request.amount,
        );

        if (nextLockedBalance.lessThan(0)) {
          throw new AppException(
            {
              code: ERROR_CODES.WALLET_INVALID_STATE,
              message: 'Trạng thái locked balance không hợp lệ',
              details: {
                walletId: wallet.id,
                lockedBalance: wallet.lockedBalance.toString(),
                amount: request.amount.toString(),
              },
            },
            409,
          );
        }

        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            lockedBalance: nextLockedBalance,
          },
        });

        await tx.walletHold.update({
          where: { id: hold.id },
          data: {
            status: WalletHoldStatus.RELEASED,
            releasedAt: new Date(),
            reason,
          },
        });

        await tx.withdrawalRequest.update({
          where: { id: request.id },
          data: {
            status: WithdrawalStatus.REJECTED,
            processedAt: new Date(),
            rejectReason: reason,
          },
        });

        const updated = await tx.withdrawalRequest.findUnique({
          where: { id: request.id },
        });

        if (!updated) {
          throw new AppException(
            {
              code: ERROR_CODES.WITHDRAWAL_REQUEST_NOT_FOUND,
              message: 'Không tìm thấy yêu cầu rút sau khi cập nhật',
              details: { id: request.id },
            },
            404,
          );
        }

        return updated;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private generateInternalCode() {
    return `WD_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }
}
