import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DepositProvider, DepositStatus } from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import * as depositOrderRepository from '../repositories/deposit-order.repository';
import { WalletService } from './wallet.service';
import { CreateDepositOrderDto } from '../dto/create-deposit-order.dto';
import { AppException } from 'src/common/errors/app.exception';
import {
  MOMO_PAYMENT_GATEWAY,
  VNPAY_PAYMENT_GATEWAY,
} from '../contracts/tokens';
import * as paymentGatewayPort from '../contracts/payment-gateway.port';

@Injectable()
export class DepositOrderService {
  constructor(
    @Inject(depositOrderRepository.DEPOSIT_ORDER_REPOSITORY)
    private readonly depositOrderRepository: depositOrderRepository.IDepositOrderRepository,
    private readonly walletService: WalletService,
    @Inject(MOMO_PAYMENT_GATEWAY)
    private readonly momoGateway: paymentGatewayPort.IPaymentGatewayPort,
    @Inject(VNPAY_PAYMENT_GATEWAY)
    private readonly vnpayGateway: paymentGatewayPort.IPaymentGatewayPort,
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

    const wallet = await this.walletService.getMyWallet(userId);
    const internalCode = this.generateInternalCode();

    const gateway = this.resolveGateway(dto.provider);

    const payment = await gateway.createDepositPayment({
      provider: dto.provider,
      internalCode,
      amount: dto.amount,
      description: `Deposit ${internalCode}`,
    });

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
      providerOrderId: payment.providerOrderId,
      paymentUrl: payment.paymentUrl,
      qrContent: payment.qrContent,
      rawPayload: payment.rawPayload as any,
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

  private resolveGateway(
    provider: DepositProvider,
  ): paymentGatewayPort.IPaymentGatewayPort {
    switch (provider) {
      case DepositProvider.MOMO:
        return this.momoGateway;
      case DepositProvider.VNPAY:
        return this.vnpayGateway;
      default:
        throw new AppException(
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Provider nạp tiền không được hỗ trợ',
            details: { provider },
          },
          400,
        );
    }
  }

  private generateInternalCode() {
    return `DEP_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;
  }
}
