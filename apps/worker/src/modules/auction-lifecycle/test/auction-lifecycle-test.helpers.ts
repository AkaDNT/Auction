import {
  AuctionStatus,
  BidStatus,
  Prisma,
  type PrismaClient,
  type User,
  type Wallet,
  WalletHoldStatus,
  WalletHoldType,
} from '@prisma/client';

let sequence = 0;

/**
 * Generates unique test IDs to avoid conflicts across repeated runs.
 */
export function nextTestId(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

/**
 * Cleans all database rows touched by auction lifecycle tests.
 */
export async function cleanAuctionLifecycleTestDatabase(prisma: PrismaClient) {
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

/**
 * Creates a user with unique email and slug defaults.
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides: Partial<User> = {},
) {
  const unique = nextTestId('user');

  return prisma.user.create({
    data: {
      name: overrides.name ?? 'Auction Lifecycle Test User',
      email: overrides.email ?? `${unique}@example.com`,
      passwordHash: overrides.passwordHash ?? 'hashed-password',
      slug: overrides.slug ?? unique,
      status: overrides.status,
    },
  });
}

/**
 * Creates a wallet for a test user.
 */
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

/**
 * Creates an auction category for auction lifecycle fixtures.
 */
export async function createTestAuctionCategory(prisma: PrismaClient) {
  const unique = nextTestId('category');

  return prisma.auctionCategory.create({
    data: {
      slug: unique,
      label: 'Lifecycle Test Category',
    },
  });
}

/**
 * Creates an auction with a seller and category relationship.
 */
export async function createTestAuction(
  prisma: PrismaClient,
  params: {
    sellerId: string;
    categoryId: string;
    status?: AuctionStatus;
    startAt?: Date | null;
    endAt?: Date;
    startingPrice?: Prisma.Decimal.Value;
    currentPrice?: Prisma.Decimal.Value | null;
  },
) {
  const unique = nextTestId('auction');

  return prisma.auction.create({
    data: {
      code: unique,
      title: 'Lifecycle Test Auction',
      slug: unique,
      description: 'Created by auction lifecycle tests',
      startingPrice: params.startingPrice ?? new Prisma.Decimal('10000'),
      currentPrice: params.currentPrice ?? null,
      status: params.status ?? AuctionStatus.LIVE,
      startAt: params.startAt ?? new Date('2026-05-18T09:00:00.000Z'),
      endAt: params.endAt ?? new Date('2026-05-18T09:59:00.000Z'),
      seller: {
        connect: { id: params.sellerId },
      },
      category: {
        connect: { id: params.categoryId },
      },
    },
  });
}

/**
 * Creates a bid for an auction lifecycle fixture.
 */
export async function createTestBid(
  prisma: PrismaClient,
  params: {
    auctionId: string;
    bidderId: string;
    amount?: Prisma.Decimal.Value;
    status?: BidStatus;
  },
) {
  return prisma.bid.create({
    data: {
      auction: {
        connect: { id: params.auctionId },
      },
      bidder: {
        connect: { id: params.bidderId },
      },
      amount: params.amount ?? new Prisma.Decimal('75000'),
      status: params.status ?? BidStatus.VALID,
    },
  });
}

/**
 * Creates an active bid hold for an auction.
 */
export async function createActiveBidHold(
  prisma: PrismaClient,
  params: {
    walletId: string;
    userId: string;
    auctionId: string;
    amount?: Prisma.Decimal.Value;
    status?: WalletHoldStatus;
  },
) {
  return prisma.walletHold.create({
    data: {
      wallet: {
        connect: { id: params.walletId },
      },
      user: {
        connect: { id: params.userId },
      },
      type: WalletHoldType.BID,
      status: params.status ?? WalletHoldStatus.ACTIVE,
      amount: params.amount ?? new Prisma.Decimal('75000'),
      referenceType: 'AUCTION',
      referenceId: params.auctionId,
      reason: 'Auction bid hold',
    },
  });
}

/**
 * Asserts Decimal values using string comparison.
 */
export function expectDecimal(value: Prisma.Decimal.Value, expected: string) {
  expect(new Prisma.Decimal(value).toString()).toBe(expected);
}
