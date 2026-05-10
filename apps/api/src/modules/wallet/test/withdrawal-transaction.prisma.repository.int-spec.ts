import {
  WalletHoldStatus,
  WalletLedgerDirection,
  WalletLedgerType,
  WithdrawalStatus,
} from '@prisma/client';
import { ERROR_CODES } from '@repo/shared';
import { PrismaService } from 'src/prisma/prisma.service';

import { WithdrawalTransactionPrismaRepository } from '../repositories/withdrawal-transaction.prisma.repository';

import {
  cleanWalletTestDatabase,
  createActiveWithdrawalHold,
  createTestUser,
  createTestWallet,
  createTestWithdrawalRequest,
  expectDecimal,
} from './wallet-test.helpers';

const describeIntegration =
  process.env.RUN_INTEGRATION_TESTS === 'true' ? describe : describe.skip;

describeIntegration('WithdrawalTransactionPrismaRepository integration', () => {
  let prisma: PrismaService;
  let repository: WithdrawalTransactionPrismaRepository;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new WithdrawalTransactionPrismaRepository(prisma);
  });

  beforeEach(async () => {
    await cleanWalletTestDatabase(prisma);
  });

  afterAll(async () => {
    await cleanWalletTestDatabase(prisma);
    await prisma.$disconnect();
  });

  it('creates a pending withdrawal request and active wallet hold', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '500000',
      lockedBalance: '100000',
    } as any);

    const request = await repository.createRequest(user.id, {
      amount: 150000,
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      bankAccountNo: '123456789',
      bankAccountName: 'Wallet Test User',
      note: 'withdraw test',
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const hold = await prisma.walletHold.findFirstOrThrow({
      where: {
        referenceType: 'WITHDRAWAL_REQUEST',
        referenceId: request.id,
      },
    });

    expect(request).toMatchObject({
      userId: user.id,
      walletId: wallet.id,
      status: WithdrawalStatus.PENDING,
      bankCode: 'VCB',
      bankName: 'Vietcombank',
      bankAccountNo: '123456789',
      bankAccountName: 'Wallet Test User',
      note: 'withdraw test',
    });
    expect(request.internalCode).toMatch(/^WD_/);
    expectDecimal(request.amount, '150000');
    expectDecimal(updatedWallet.balance, '500000');
    expectDecimal(updatedWallet.lockedBalance, '250000');
    expect(hold).toMatchObject({
      walletId: wallet.id,
      userId: user.id,
      status: WalletHoldStatus.ACTIVE,
      referenceType: 'WITHDRAWAL_REQUEST',
      referenceId: request.id,
      reason: 'User requested withdrawal',
    });
    expectDecimal(hold.amount, '150000');
  });

  it('rolls back withdrawal creation when available balance is insufficient', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '100000',
      lockedBalance: '25000',
    } as any);

    await expect(
      repository.createRequest(user.id, {
        amount: 100000,
        bankAccountNo: '123456789',
        bankAccountName: 'Wallet Test User',
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INSUFFICIENT_AVAILABLE_BALANCE,
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const requestCount = await prisma.withdrawalRequest.count();
    const holdCount = await prisma.walletHold.count();

    expectDecimal(updatedWallet.lockedBalance, '25000');
    expect(requestCount).toBe(0);
    expect(holdCount).toBe(0);
  });

  it('throws when creating a withdrawal for a user without wallet', async () => {
    const user = await createTestUser(prisma);

    await expect(
      repository.createRequest(user.id, {
        amount: 100000,
        bankAccountNo: '123456789',
        bankAccountName: 'Wallet Test User',
      }),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_NOT_FOUND,
      details: { userId: user.id },
    });
  });

  it('completes a withdrawal, captures hold, debits wallet, and writes ledger', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '500000',
      lockedBalance: '150000',
    } as any);
    const request = await createTestWithdrawalRequest(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '150000',
      status: WithdrawalStatus.PENDING,
    });
    const hold = await createActiveWithdrawalHold(prisma, request);

    const result = await repository.completeRequest(request.id);

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedHold = await prisma.walletHold.findUniqueOrThrow({
      where: { id: hold.id },
    });
    const ledger = await prisma.walletLedgerEntry.findUniqueOrThrow({
      where: { idempotencyKey: `WITHDRAWAL_COMPLETED_${request.id}` },
    });

    expect(result.status).toBe(WithdrawalStatus.COMPLETED);
    expect(result.processedAt).toBeInstanceOf(Date);
    expect(result.completedAt).toBeInstanceOf(Date);
    expectDecimal(updatedWallet.balance, '350000');
    expectDecimal(updatedWallet.lockedBalance, '0');
    expect(updatedHold.status).toBe(WalletHoldStatus.CAPTURED);
    expect(updatedHold.capturedAt).toBeInstanceOf(Date);
    expect(ledger).toMatchObject({
      walletId: wallet.id,
      userId: user.id,
      direction: WalletLedgerDirection.DEBIT,
      type: WalletLedgerType.WITHDRAWAL_COMPLETED,
      referenceType: 'WITHDRAWAL_REQUEST',
      referenceId: request.id,
    });
    expectDecimal(ledger.amount, '150000');
    expectDecimal(ledger.balanceAfter, '350000');
    expectDecimal(ledger.lockedAfter, '0');
  });

  it('rejects a withdrawal and releases the hold without debiting balance', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '500000',
      lockedBalance: '150000',
    } as any);
    const request = await createTestWithdrawalRequest(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '150000',
      status: WithdrawalStatus.PROCESSING,
    });
    const hold = await createActiveWithdrawalHold(prisma, request);

    const result = await repository.rejectRequest(
      request.id,
      'Invalid bank account',
    );

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedHold = await prisma.walletHold.findUniqueOrThrow({
      where: { id: hold.id },
    });
    const ledgerCount = await prisma.walletLedgerEntry.count();

    expect(result.status).toBe(WithdrawalStatus.REJECTED);
    expect(result.rejectReason).toBe('Invalid bank account');
    expect(result.processedAt).toBeInstanceOf(Date);
    expectDecimal(updatedWallet.balance, '500000');
    expectDecimal(updatedWallet.lockedBalance, '0');
    expect(updatedHold.status).toBe(WalletHoldStatus.RELEASED);
    expect(updatedHold.releasedAt).toBeInstanceOf(Date);
    expect(updatedHold.reason).toBe('Invalid bank account');
    expect(ledgerCount).toBe(0);
  });

  it('throws when completing a missing withdrawal request', async () => {
    await expect(
      repository.completeRequest('missing-id'),
    ).rejects.toMatchObject({
      code: ERROR_CODES.WITHDRAWAL_REQUEST_NOT_FOUND,
      details: { id: 'missing-id' },
    });
  });

  it('rolls back completion when withdrawal status is invalid', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '500000',
      lockedBalance: '150000',
    } as any);
    const request = await createTestWithdrawalRequest(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '150000',
      status: WithdrawalStatus.COMPLETED,
    });

    await expect(repository.completeRequest(request.id)).rejects.toMatchObject({
      code: ERROR_CODES.WITHDRAWAL_REQUEST_INVALID_STATUS,
      details: {
        id: request.id,
        status: WithdrawalStatus.COMPLETED,
      },
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedRequest = await prisma.withdrawalRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
    const ledgerCount = await prisma.walletLedgerEntry.count();

    expectDecimal(updatedWallet.balance, '500000');
    expectDecimal(updatedWallet.lockedBalance, '150000');
    expect(updatedRequest.status).toBe(WithdrawalStatus.COMPLETED);
    expect(ledgerCount).toBe(0);
  });

  it('rolls back completion when the active withdrawal hold is missing', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '500000',
      lockedBalance: '150000',
    } as any);
    const request = await createTestWithdrawalRequest(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '150000',
      status: WithdrawalStatus.PENDING,
    });

    await expect(repository.completeRequest(request.id)).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_HOLD_NOT_FOUND,
      details: { withdrawalRequestId: request.id },
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedRequest = await prisma.withdrawalRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
    const ledgerCount = await prisma.walletLedgerEntry.count();

    expectDecimal(updatedWallet.balance, '500000');
    expectDecimal(updatedWallet.lockedBalance, '150000');
    expect(updatedRequest.status).toBe(WithdrawalStatus.PENDING);
    expect(ledgerCount).toBe(0);
  });

  it('rolls back completion when wallet balance would become invalid', async () => {
    const user = await createTestUser(prisma);
    const wallet = await createTestWallet(prisma, user.id, {
      balance: '50000',
      lockedBalance: '150000',
    } as any);
    const request = await createTestWithdrawalRequest(prisma, {
      userId: user.id,
      walletId: wallet.id,
      amount: '150000',
      status: WithdrawalStatus.PENDING,
    });
    const hold = await createActiveWithdrawalHold(prisma, request);

    await expect(repository.completeRequest(request.id)).rejects.toMatchObject({
      code: ERROR_CODES.WALLET_INVALID_STATE,
      details: {
        walletId: wallet.id,
        balance: '50000',
        lockedBalance: '150000',
        amount: '150000',
      },
    });

    const updatedWallet = await prisma.wallet.findUniqueOrThrow({
      where: { id: wallet.id },
    });
    const updatedHold = await prisma.walletHold.findUniqueOrThrow({
      where: { id: hold.id },
    });
    const updatedRequest = await prisma.withdrawalRequest.findUniqueOrThrow({
      where: { id: request.id },
    });

    expectDecimal(updatedWallet.balance, '50000');
    expectDecimal(updatedWallet.lockedBalance, '150000');
    expect(updatedHold.status).toBe(WalletHoldStatus.ACTIVE);
    expect(updatedRequest.status).toBe(WithdrawalStatus.PENDING);
  });
});
