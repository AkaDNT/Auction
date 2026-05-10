import {
  DepositProvider,
  DepositStatus,
  Prisma,
  type PrismaClient,
  type User,
  type Wallet,
  WalletHoldStatus,
  WalletHoldType,
  type WithdrawalRequest,
  WithdrawalStatus,
} from '@prisma/client';

let sequence = 0;

export function nextTestId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

export async function cleanWalletTestDatabase(prisma: PrismaClient) {
  await prisma.walletLedgerEntry.deleteMany();
  await prisma.walletHold.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.depositOrder.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.auctionSettlement.deleteMany();
  await prisma.auctionImage.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.auctionCategory.deleteMany();
  await prisma.uploadAsset.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<User> = {},
) {
  const unique = nextTestId('user');

  return prisma.user.create({
    data: {
      name: overrides.name ?? 'Wallet Test User',
      email: overrides.email ?? `${unique}@example.com`,
      passwordHash: overrides.passwordHash ?? 'hashed-password',
      slug: overrides.slug ?? unique,
      status: overrides.status,
    },
  });
}

export async function createTestWallet(
  prisma: PrismaClient,
  userId: string,
  overrides: Partial<Wallet> = {},
) {
  return prisma.wallet.create({
    data: {
      user: {
        connect: { id: userId },
      },
      balance: overrides.balance ?? new Prisma.Decimal(0),
      lockedBalance: overrides.lockedBalance ?? new Prisma.Decimal(0),
      currency: overrides.currency ?? 'VND',
      status: overrides.status,
    },
  });
}

export async function createTestDepositOrder(
  prisma: PrismaClient,
  params: {
    userId: string;
    walletId: string;
    amount?: Prisma.Decimal.Value;
    status?: DepositStatus;
    provider?: DepositProvider;
    providerOrderId?: string | null;
    providerTxnId?: string | null;
  },
) {
  const unique = nextTestId('deposit');

  return prisma.depositOrder.create({
    data: {
      user: {
        connect: { id: params.userId },
      },
      wallet: {
        connect: { id: params.walletId },
      },
      amount: params.amount ?? 100_000,
      status: params.status ?? DepositStatus.PENDING,
      provider: params.provider ?? DepositProvider.MOMO,
      internalCode: unique,
      providerOrderId: params.providerOrderId ?? `${unique}-provider-order`,
      providerTxnId: params.providerTxnId ?? undefined,
    },
  });
}

export async function createTestWithdrawalRequest(
  prisma: PrismaClient,
  params: {
    userId: string;
    walletId: string;
    amount?: Prisma.Decimal.Value;
    status?: WithdrawalStatus;
  },
) {
  const unique = nextTestId('withdrawal');

  return prisma.withdrawalRequest.create({
    data: {
      user: {
        connect: { id: params.userId },
      },
      wallet: {
        connect: { id: params.walletId },
      },
      amount: params.amount ?? 100_000,
      status: params.status ?? WithdrawalStatus.PENDING,
      bankAccountNo: '123456789',
      bankAccountName: 'Wallet Test User',
      internalCode: unique,
    },
  });
}

export async function createActiveWithdrawalHold(
  prisma: PrismaClient,
  request: WithdrawalRequest,
) {
  return prisma.walletHold.create({
    data: {
      wallet: {
        connect: { id: request.walletId },
      },
      user: {
        connect: { id: request.userId },
      },
      type: WalletHoldType.WITHDRAWAL,
      status: WalletHoldStatus.ACTIVE,
      amount: request.amount,
      referenceType: 'WITHDRAWAL_REQUEST',
      referenceId: request.id,
      reason: 'User requested withdrawal',
    },
  });
}

export function expectDecimal(value: Prisma.Decimal.Value, expected: string) {
  expect(new Prisma.Decimal(value).toString()).toBe(expected);
}
