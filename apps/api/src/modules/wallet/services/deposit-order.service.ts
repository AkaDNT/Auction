import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DepositStatus } from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import * as depositOrderRepository from '../repositories/deposit-order.repository';
import { WalletService } from './wallet.service';
import { CreateDepositOrderDto } from '../dto/create-deposit-order.dto';
import { AppException } from 'src/common/errors/app.exception';

@Injectable()
export class DepositOrderService {
  constructor(
    @Inject(depositOrderRepository.DEPOSIT_ORDER_REPOSITORY)
    private readonly depositOrderRepository: depositOrderRepository.IDepositOrderRepository,
    private readonly walletService: WalletService,
  ) {}

  async create(userId: string, dto: CreateDepositOrderDto) {
    if (dto.amount <= 0) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Số tiền nạp không hợp lệ',
          details: {
            field: 'amount',
            value: dto.amount,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const wallet = await this.walletService.getOrCreateWallet(userId);
    const internalCode = this.generateInternalCode();

    return this.depositOrderRepository.create({
      user: {
        connect: { id: userId },
      },
      wallet: {
        connect: { id: wallet.id },
      },
      provider: dto.provider,
      amount: dto.amount,
      status: DepositStatus.PENDING,
      internalCode,
    });
  }

  async findMyOrders(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.depositOrderRepository.findManyByUser(userId, page, limit),
      this.depositOrderRepository.countByUser(userId),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  private generateInternalCode() {
    return `DEP_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }
}
