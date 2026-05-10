import { Test, type TestingModule } from '@nestjs/testing';
import { DepositProvider } from '@prisma/client';

import { type IPaymentGatewayPort } from '../contracts/payment-gateway.port';
import {
  MOMO_PAYMENT_GATEWAY,
  VNPAY_PAYMENT_GATEWAY,
} from '../contracts/tokens';
import {
  DEPOSIT_TRANSACTION_REPOSITORY,
  type IDepositTransactionRepository,
} from '../repositories/deposit-transaction.repository';
import { DepositWebhookService } from '../services/deposit-webhook.service';

describe('DepositWebhookService', () => {
  let service: DepositWebhookService;
  let momoGateway: jest.Mocked<IPaymentGatewayPort>;
  let vnpayGateway: jest.Mocked<IPaymentGatewayPort>;
  let depositTransactionRepository: jest.Mocked<IDepositTransactionRepository>;

  beforeEach(async () => {
    momoGateway = {
      createDepositPayment: jest.fn(),
      verifyDepositWebhook: jest.fn(),
    };
    vnpayGateway = {
      createDepositPayment: jest.fn(),
      verifyDepositWebhook: jest.fn(),
    };
    depositTransactionRepository = {
      markPaidAndCreditWallet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositWebhookService,
        {
          provide: MOMO_PAYMENT_GATEWAY,
          useValue: momoGateway,
        },
        {
          provide: VNPAY_PAYMENT_GATEWAY,
          useValue: vnpayGateway,
        },
        {
          provide: DEPOSIT_TRANSACTION_REPOSITORY,
          useValue: depositTransactionRepository,
        },
      ],
    }).compile();

    service = module.get(DepositWebhookService);
  });

  it('marks the order paid and credits wallet after a successful MoMo webhook', async () => {
    const rawPayload = { transId: 'txn-1' };
    momoGateway.verifyDepositWebhook.mockResolvedValue({
      success: true,
      providerOrderId: 'provider-order-1',
      providerTransactionId: 'provider-txn-1',
      rawPayload,
    });
    depositTransactionRepository.markPaidAndCreditWallet.mockResolvedValue({
      id: 'deposit-1',
    } as any);

    await expect(
      service.handleProviderWebhook(DepositProvider.MOMO, rawPayload),
    ).resolves.toEqual({
      success: true,
      depositOrderId: 'deposit-1',
    });

    expect(momoGateway.verifyDepositWebhook).toHaveBeenCalledWith(rawPayload);
    expect(vnpayGateway.verifyDepositWebhook).not.toHaveBeenCalled();
    expect(
      depositTransactionRepository.markPaidAndCreditWallet,
    ).toHaveBeenCalledWith({
      providerOrderId: 'provider-order-1',
      providerTransactionId: 'provider-txn-1',
      rawPayload,
    });
  });

  it('marks the order paid after a successful VNPay webhook without provider transaction id', async () => {
    const rawPayload = { txnRef: 'vnpay-order-1' };
    vnpayGateway.verifyDepositWebhook.mockResolvedValue({
      success: true,
      providerOrderId: 'vnpay-order-1',
      rawPayload,
    });
    depositTransactionRepository.markPaidAndCreditWallet.mockResolvedValue({
      id: 'deposit-2',
    } as any);

    await expect(
      service.handleProviderWebhook(DepositProvider.VNPAY, rawPayload),
    ).resolves.toEqual({
      success: true,
      depositOrderId: 'deposit-2',
    });

    expect(
      depositTransactionRepository.markPaidAndCreditWallet,
    ).toHaveBeenCalledWith({
      providerOrderId: 'vnpay-order-1',
      providerTransactionId: undefined,
      rawPayload,
    });
  });

  it('does not credit wallet when gateway verification fails', async () => {
    vnpayGateway.verifyDepositWebhook.mockResolvedValue({
      success: false,
      providerOrderId: 'provider-order-1',
    });

    await expect(
      service.handleProviderWebhook(DepositProvider.VNPAY, { invalid: true }),
    ).resolves.toEqual({ success: false });

    expect(
      depositTransactionRepository.markPaidAndCreditWallet,
    ).not.toHaveBeenCalled();
  });

  it('bubbles gateway verification failures without crediting wallet', async () => {
    const error = new Error('invalid signature parser crashed');
    momoGateway.verifyDepositWebhook.mockRejectedValue(error);

    await expect(
      service.handleProviderWebhook(DepositProvider.MOMO, {}),
    ).rejects.toBe(error);

    expect(
      depositTransactionRepository.markPaidAndCreditWallet,
    ).not.toHaveBeenCalled();
  });

  it('bubbles repository failures after a successful verification', async () => {
    const error = new Error('transaction failed');
    momoGateway.verifyDepositWebhook.mockResolvedValue({
      success: true,
      providerOrderId: 'provider-order-1',
    });
    depositTransactionRepository.markPaidAndCreditWallet.mockRejectedValue(
      error,
    );

    await expect(
      service.handleProviderWebhook(DepositProvider.MOMO, {}),
    ).rejects.toBe(error);
  });

  it('throws for unsupported providers', async () => {
    await expect(
      service.handleProviderWebhook('UNSUPPORTED' as DepositProvider, {}),
    ).rejects.toThrow('Unsupported provider: UNSUPPORTED');
  });
});
