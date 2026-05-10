import {
  DepositProvider,
  DepositStatus,
  WalletLedgerDirection,
  WalletLedgerType,
} from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

import { DepositPrismaTransactionRepository } from '../repositories/deposit-transaction.prisma.repository';

import {
  cleanWalletTestDatabase,
  createTestDepositOrder,
  createTestUser,
  createTestWallet,
  expectDecimal,
} from './wallet-test.helpers';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration('DepositPrismaTransactionRepository integration', () => {
  let prisma: PrismaService;
  let repository: DepositPrismaTransactionRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new DepositPrismaTransactionRepository(prisma);
  });

  beforeEach(async () => {
    await cleanWalletTestDatabase(prisma);
  });

  afterAll(async () => {
    await cleanWalletTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('marks a pending deposit paid, credits wallet, and writes a ledger entry', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '250000',
      lockedBalance: '50000',
    } as any);
    const order = await createTestDepositOrder(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '100000',
      status: DepositStatus.PENDING,
      provider: DepositProvider.MOMO,
      providerOrderId: 'provider-order-1',
    });

    const result = await repository.markPaidAndCreditWallet({
      providerOrderId: 'provider-order-1',
      providerTransactionId: 'provider-txn-1',
      rawPayload: { ok: true },
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const ledger = await prisma.walletLedgerEntry.findUniqueOrThrow({
      where: { idempotencyKey: `DEPOSIT_SETTLED_${order.id}` },
    });

    expect(result.id).toBe(order.id);
    expect(result.status).toBe(DepositStatus.PAID);
    expect(result.providerTxnId).toBe('provider-txn-1');
    expect(result.paidAt).toBeInstanceOf(Date);
    expectDecimal(updatedWallet.balance, '350000');
    expectDecimal(updatedWallet.lockedBalance, '50000');
    expect(ledger).toMatchObject({
      walletId: wallet.id,
      userId: user.id,
      direction: WalletLedgerDirection.CREDIT,
      type: WalletLedgerType.DEPOSIT_SETTLED,
      referenceType: 'DEPOSIT_ORDER',
      referenceId: order.id,
    });
    expectDecimal(ledger.amount, '100000');
    expectDecimal(ledger.balanceAfter, '350000');
    expectDecimal(ledger.lockedAfter, '50000');
  });

  it('settles a processing deposit order', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id);
    const order = await createTestDepositOrder(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '75000',
      status: DepositStatus.PROCESSING,
      providerOrderId: 'provider-order-2',
    });

    await expect(
      repository.markPaidAndCreditWallet({
        providerOrderId: 'provider-order-2',
      }),
    ).resolves.toMatchObject({
      id: order.id,
      status: DepositStatus.PAID,
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    expectDecimal(updatedWallet.balance, '75000');
  });

  it('is idempotent when the deposit order is already paid', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '100000',
    } as any);
    const order = await createTestDepositOrder(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '50000',
      status: DepositStatus.PAID,
      providerOrderId: 'provider-order-3',
      providerTxnId: 'existing-provider-txn',
    });

    const result = await repository.markPaidAndCreditWallet({
      providerOrderId: 'provider-order-3',
      providerTransactionId: 'new-provider-txn',
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const ledgerCount = await prisma.walletLedgerEntry.count();

    expect(result).toMatchObject({
      id: order.id,
      status: DepositStatus.PAID,
      providerTxnId: 'existing-provider-txn',
    });
    expectDecimal(updatedWallet.balance, '100000');
    expect(ledgerCount).toBe(0);
  });

  it('throws when provider order id does not exist', async () => {
    await expect(
      repository.markPaidAndCreditWallet({
        providerOrderId: 'missing-provider-order',
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.DEPOSIT_ORDER_NOT_FOUND,
      details: { providerOrderId: 'missing-provider-order' },
    });
  });

  it('rolls back wallet and ledger changes for invalid deposit status', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '100000',
    } as any);
    const order = await createTestDepositOrder(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '50000',
      status: DepositStatus.FAILED,
      providerOrderId: 'provider-order-4',
    });

    await expect(
      repository.markPaidAndCreditWallet({
        providerOrderId: 'provider-order-4',
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.DEPOSIT_ORDER_INVALID_STATUS,
      details: {
        orderId: order.id,
        status: DepositStatus.FAILED,
      },
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedOrder = await prisma.depositOrder.findUniqueOrThrow({
      where: { id: order.id },
    });
    const ledgerCount = await prisma.walletLedgerEntry.count();

    expectDecimal(updatedWallet.balance, '100000');
    expect(updatedOrder.status).toBe(DepositStatus.FAILED);
    expect(updatedOrder.paidAt).toBeNull();
    expect(ledgerCount).toBe(0);
  });
});
