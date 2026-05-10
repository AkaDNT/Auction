import { Test, type TestingModule } from '@nestjs/testing';
import { DepositProvider, DepositStatus } from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';

import { type IPaymentGatewayPort } from '../contracts/payment-gateway.port';
import {
  MOMO_PAYMENT_GATEWAY,
  VNPAY_PAYMENT_GATEWAY,
} from '../contracts/tokens';
import {
  DEPOSIT_ORDER_REPOSITORY,
  type IDepositOrderRepository,
} from '../repositories/deposit-order.repository';
import { DepositOrderService } from '../services/deposit-order.service';
import { WalletService } from '../services/wallet.service';

describe('DepositOrderService', () => {
  let service: DepositOrderService;
  let depositOrderRepository: jest.Mocked<IDepositOrderRepository>;
  let walletService: jest.Mocked<Pick<WalletService, 'getMyWallet'>>;
  let momoGateway: jest.Mocked<IPaymentGatewayPort>;
  let vnpayGateway: jest.Mocked<IPaymentGatewayPort>;

  beforeEach(async () => {
    depositOrderRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByInternalCode: jest.fn(),
      findByProviderOrderId: jest.fn(),
      update: jest.fn(),
      findManyByUser: jest.fn(),
      countByUser: jest.fn(),
      findManyByStatus: jest.fn(),
    };
    walletService = {
      getMyWallet: jest.fn(),
    };
    momoGateway = {
      createDepositPayment: jest.fn(),
      verifyDepositWebhook: jest.fn(),
    };
    vnpayGateway = {
      createDepositPayment: jest.fn(),
      verifyDepositWebhook: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositOrderService,
        {
          provide: DEPOSIT_ORDER_REPOSITORY,
          useValue: depositOrderRepository,
        },
        {
          provide: WalletService,
          useValue: walletService,
        },
        {
          provide: MOMO_PAYMENT_GATEWAY,
          useValue: momoGateway,
        },
        {
          provide: VNPAY_PAYMENT_GATEWAY,
          useValue: vnpayGateway,
        },
      ],
    }).compile();

    service = module.get(DepositOrderService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a pending MoMo deposit order with payment gateway data', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);

    walletService.getMyWallet.mockResolvedValue({ id: 'wallet-1' } as any);
    momoGateway.createDepositPayment.mockResolvedValue({
      providerOrderId: 'momo-order-1',
      paymentUrl: 'https://pay.example/momo-order-1',
      qrContent: 'qr-content',
      rawPayload: { partnerCode: 'MOMO' },
    });
    depositOrderRepository.create.mockImplementation((data) => {
      return Promise.resolve({ id: 'deposit-1', ...data } as any);
    });

    await service.create('user-1', {
      provider: DepositProvider.MOMO,
      amount: 50000,
    });

    const paymentParams = momoGateway.createDepositPayment.mock.calls[0][0];
    const createData = depositOrderRepository.create.mock.calls[0][0];

    expect(walletService.getMyWallet).toHaveBeenCalledWith('user-1');
    expect(paymentParams).toEqual({
      provider: DepositProvider.MOMO,
      internalCode: expect.stringMatching(/^DEP_1700000000000_/),
      amount: 50000,
      description: expect.stringMatching(/^Deposit DEP_1700000000000_/),
    });
    expect(createData.internalCode).toBe(paymentParams.internalCode);
    expect(createData).toEqual(
      expect.objectContaining({
        user: { connect: { id: 'user-1' } },
        wallet: { connect: { id: 'wallet-1' } },
        provider: DepositProvider.MOMO,
        amount: 50000,
        status: DepositStatus.PENDING,
        providerOrderId: 'momo-order-1',
        paymentUrl: 'https://pay.example/momo-order-1',
        qrContent: 'qr-content',
        rawPayload: { partnerCode: 'MOMO' },
      }),
    );
    expect(vnpayGateway.createDepositPayment).not.toHaveBeenCalled();
  });

  it('uses the VNPay gateway for VNPay deposits', async () => {
    walletService.getMyWallet.mockResolvedValue({ id: 'wallet-1' } as any);
    vnpayGateway.createDepositPayment.mockResolvedValue({
      providerOrderId: 'vnpay-order-1',
    });
    depositOrderRepository.create.mockResolvedValue({ id: 'deposit-1' } as any);

    await service.create('user-1', {
      provider: DepositProvider.VNPAY,
      amount: 100000,
    });

    expect(vnpayGateway.createDepositPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: DepositProvider.VNPAY,
        amount: 100000,
      }),
    );
    expect(momoGateway.createDepositPayment).not.toHaveBeenCalled();
  });

  it('rejects non-positive deposit amounts before touching dependencies', async () => {
    await expect(
      service.create('user-1', {
        provider: DepositProvider.MOMO,
        amount: 0,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.VALIDATION_ERROR,
      details: { field: 'amount', value: 0 },
    });

    expect(walletService.getMyWallet).not.toHaveBeenCalled();
    expect(momoGateway.createDepositPayment).not.toHaveBeenCalled();
    expect(depositOrderRepository.create).not.toHaveBeenCalled();
  });

  it('rejects unsupported deposit providers after resolving the wallet', async () => {
    walletService.getMyWallet.mockResolvedValue({ id: 'wallet-1' } as any);

    await expect(
      service.create('user-1', {
        provider: DepositProvider.BANK_TRANSFER,
        amount: 50000,
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.VALIDATION_ERROR,
      details: { provider: DepositProvider.BANK_TRANSFER },
    });

    expect(walletService.getMyWallet).toHaveBeenCalledWith('user-1');
    expect(momoGateway.createDepositPayment).not.toHaveBeenCalled();
    expect(vnpayGateway.createDepositPayment).not.toHaveBeenCalled();
    expect(depositOrderRepository.create).not.toHaveBeenCalled();
  });

  it('does not create an order when wallet lookup fails', async () => {
    const error = new Error('wallet missing');
    walletService.getMyWallet.mockRejectedValue(error);

    await expect(
      service.create('user-1', {
        provider: DepositProvider.MOMO,
        amount: 50000,
      }),
    ).rejects.toBe(error);

    expect(momoGateway.createDepositPayment).not.toHaveBeenCalled();
    expect(depositOrderRepository.create).not.toHaveBeenCalled();
  });

  it('does not create an order when payment gateway fails', async () => {
    const error = new Error('gateway unavailable');
    walletService.getMyWallet.mockResolvedValue({ id: 'wallet-1' } as any);
    momoGateway.createDepositPayment.mockRejectedValue(error);

    await expect(
      service.create('user-1', {
        provider: DepositProvider.MOMO,
        amount: 50000,
      }),
    ).rejects.toBe(error);

    expect(depositOrderRepository.create).not.toHaveBeenCalled();
  });

  it('returns paginated deposit orders for the current user', async () => {
    const orders = [{ id: 'deposit-1' }, { id: 'deposit-2' }] as any;
    depositOrderRepository.findManyByUser.mockResolvedValue(orders);
    depositOrderRepository.countByUser.mockResolvedValue(7);

    await expect(service.findMyOrders('user-1', 2, 5)).resolves.toEqual({
      items: orders,
      meta: {
        page: 2,
        limit: 5,
        total: 7,
      },
    });
  });

  it('uses default pagination for deposit orders', async () => {
    depositOrderRepository.findManyByUser.mockResolvedValue([]);
    depositOrderRepository.countByUser.mockResolvedValue(0);

    await expect(service.findMyOrders('user-1')).resolves.toEqual({
      items: [],
      meta: {
        page: 1,
        limit: 20,
        total: 0,
      },
    });
    expect(depositOrderRepository.findManyByUser).toHaveBeenCalledWith(
      'user-1',
      1,
      20,
    );
  });
});
