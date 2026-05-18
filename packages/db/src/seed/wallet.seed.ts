import {
  DepositProvider,
  DepositStatus,
  Prisma,
  PrismaClient,
  WalletHoldStatus,
  WalletHoldType,
  WalletLedgerDirection,
  WalletLedgerType,
  WalletStatus,
  WithdrawalStatus,
} from "@prisma/client";

type UserLite = {
  id: string;
  email: string;
};

type WalletLite = {
  id: string;
  userId: string;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDecimal(value: number) {
  return new Prisma.Decimal(value);
}

function getWalletStatus(index: number): WalletStatus {
  const statuses: WalletStatus[] = [WalletStatus.ACTIVE];
  return statuses[index % statuses.length];
}

function getDepositProvider(index: number): DepositProvider {
  const providers: DepositProvider[] = [
    DepositProvider.MOMO,
    DepositProvider.VNPAY,
    DepositProvider.BANK_TRANSFER,
  ];
  return providers[index % providers.length];
}

function getDepositStatus(index: number): DepositStatus {
  const statuses: DepositStatus[] = [
    DepositStatus.PENDING,
    DepositStatus.PROCESSING,
    DepositStatus.PAID,
    DepositStatus.FAILED,
    DepositStatus.EXPIRED,
    DepositStatus.CANCELLED,
  ];
  return statuses[index % statuses.length];
}

function getWithdrawalStatus(index: number): WithdrawalStatus {
  const statuses: WithdrawalStatus[] = [
    WithdrawalStatus.PENDING,
    WithdrawalStatus.APPROVED,
    WithdrawalStatus.PROCESSING,
    WithdrawalStatus.COMPLETED,
    WithdrawalStatus.REJECTED,
    WithdrawalStatus.CANCELLED,
  ];
  return statuses[index % statuses.length];
}

function getHoldType(index: number): WalletHoldType {
  const types: WalletHoldType[] = [
    WalletHoldType.BID,
    WalletHoldType.WITHDRAWAL,
  ];
  return types[index % types.length];
}

function getHoldStatus(index: number): WalletHoldStatus {
  const statuses: WalletHoldStatus[] = [
    WalletHoldStatus.ACTIVE,
    WalletHoldStatus.RELEASED,
    WalletHoldStatus.CAPTURED,
    WalletHoldStatus.CANCELLED,
    WalletHoldStatus.EXPIRED,
  ];
  return statuses[index % statuses.length];
}

function getLedgerType(index: number): WalletLedgerType {
  const types: WalletLedgerType[] = [
    WalletLedgerType.DEPOSIT_SETTLED,
    WalletLedgerType.WITHDRAWAL_REQUEST_CREATED,
    WalletLedgerType.WITHDRAWAL_COMPLETED,
    WalletLedgerType.WITHDRAWAL_REJECTED_REFUND,
    WalletLedgerType.BID_HOLD_CAPTURED,
    WalletLedgerType.BID_HOLD_RELEASED_ADJUSTMENT,
    WalletLedgerType.ADMIN_ADJUSTMENT_CREDIT,
    WalletLedgerType.ADMIN_ADJUSTMENT_DEBIT,
  ];
  return types[index % types.length];
}

function getLedgerDirection(type: WalletLedgerType): WalletLedgerDirection {
  switch (type) {
    case WalletLedgerType.DEPOSIT_SETTLED:
    case WalletLedgerType.WITHDRAWAL_REJECTED_REFUND:
    case WalletLedgerType.BID_HOLD_RELEASED_ADJUSTMENT:
    case WalletLedgerType.ADMIN_ADJUSTMENT_CREDIT:
      return WalletLedgerDirection.CREDIT;

    default:
      return WalletLedgerDirection.DEBIT;
  }
}

async function seedWallets(prisma: PrismaClient, users: UserLite[]) {
  const wallets = users.map((user, index) => {
    const base = 1_500_000 + index * 350_000;
    const locked = 50_000 + (index % 4) * 25_000;

    const balanceValue =
      user.email.toLowerCase() !== "giahuy@gmail.com" ? 1000000000 : base;

    return {
      userId: user.id,
      status: getWalletStatus(index),
      balance: toDecimal(balanceValue),
      lockedBalance: toDecimal(locked),
      currency: "VND",
    };
  });

  for (const item of wallets) {
    await prisma.wallet.upsert({
      where: {
        userId: item.userId,
      },
      update: {
        status: item.status,
        balance: item.balance,
        lockedBalance: item.lockedBalance,
        currency: item.currency,
      },
      create: item,
    });
  }

  return prisma.wallet.findMany({
    select: {
      id: true,
      userId: true,
    },
    where: {
      userId: {
        in: users.map((user) => user.id),
      },
    },
  });
}

async function seedDepositOrders(prisma: PrismaClient, wallets: WalletLite[]) {
  await prisma.depositOrder.deleteMany();

  const now = new Date();
  const data = wallets.flatMap((wallet, walletIndex) =>
    Array.from({ length: 3 }).map((_, orderIndex) => {
      const status = getDepositStatus(walletIndex + orderIndex);
      const provider = getDepositProvider(walletIndex + orderIndex);
      const amount = 300_000 + orderIndex * 200_000 + walletIndex * 40_000;
      const internalCode = `DEP-${walletIndex + 1}-${orderIndex + 1}`;
      const isPaid = status === DepositStatus.PAID;
      const isOpen =
        status === DepositStatus.PENDING || status === DepositStatus.PROCESSING;

      return {
        walletId: wallet.id,
        userId: wallet.userId,
        provider,
        status,
        amount: toDecimal(amount),
        currency: "VND",
        internalCode,
        providerOrderId: `PO-${internalCode}`,
        providerTxnId: isPaid ? `PT-${internalCode}` : null,
        paymentUrl: isOpen
          ? `https://payments.example/checkout/${internalCode}`
          : null,
        qrContent:
          provider === DepositProvider.BANK_TRANSFER
            ? null
            : `QR-${internalCode}`,
        rawPayload: {
          source: "seed",
          internalCode,
          provider,
        },
        paidAt: isPaid ? addDays(now, -1) : null,
        expiredAt:
          status === DepositStatus.EXPIRED ? addDays(now, -1) : addDays(now, 1),
      };
    }),
  );

  if (data.length > 0) {
    await prisma.depositOrder.createMany({
      data,
    });
  }

  return data.length;
}

async function seedWithdrawalRequests(
  prisma: PrismaClient,
  wallets: WalletLite[],
) {
  await prisma.withdrawalRequest.deleteMany();

  const now = new Date();

  const data = wallets.flatMap((wallet, walletIndex) =>
    Array.from({ length: 2 }).map((_, requestIndex) => {
      const status = getWithdrawalStatus(walletIndex + requestIndex);
      const amount = 180_000 + walletIndex * 25_000 + requestIndex * 50_000;
      const internalCode = `WDR-${walletIndex + 1}-${requestIndex + 1}`;

      return {
        walletId: wallet.id,
        userId: wallet.userId,
        status,
        amount: toDecimal(amount),
        currency: "VND",
        bankCode: "VCB",
        bankName: "Vietcombank",
        bankAccountNo: `1900${String(walletIndex + 100).padStart(6, "0")}`,
        bankAccountName: `Seed User ${walletIndex + 1}`,
        internalCode,
        externalTransferId:
          status === WithdrawalStatus.COMPLETED ? `EXT-${internalCode}` : null,
        note: "Seed test withdrawal",
        rejectReason:
          status === WithdrawalStatus.REJECTED
            ? "Invalid account information"
            : null,
        requestedAt: addDays(now, -2),
        processedAt:
          status === WithdrawalStatus.PENDING ? null : addDays(now, -1),
        completedAt: status === WithdrawalStatus.COMPLETED ? now : null,
        cancelledAt: status === WithdrawalStatus.CANCELLED ? now : null,
      };
    }),
  );

  if (data.length > 0) {
    await prisma.withdrawalRequest.createMany({
      data,
    });
  }

  return data.length;
}

async function seedWalletHolds(prisma: PrismaClient, wallets: WalletLite[]) {
  await prisma.walletHold.deleteMany();

  const now = new Date();
  const bids = await prisma.bid.findMany({
    select: {
      id: true,
      auctionId: true,
      bidderId: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 80,
  });

  const bidsByUser = new Map<string, typeof bids>();

  for (const bid of bids) {
    const existing = bidsByUser.get(bid.bidderId) ?? [];
    existing.push(bid);
    bidsByUser.set(bid.bidderId, existing);
  }

  const data = wallets.flatMap((wallet, walletIndex) =>
    Array.from({ length: 2 }).map((_, holdIndex) => {
      const type = getHoldType(walletIndex + holdIndex);
      const status = getHoldStatus(walletIndex + holdIndex);
      const amount = 120_000 + holdIndex * 80_000 + walletIndex * 15_000;
      const userBids = bidsByUser.get(wallet.userId) ?? [];
      const linkedBid = userBids[holdIndex % Math.max(userBids.length, 1)];
      const referenceType = type === WalletHoldType.BID ? "BID" : "WITHDRAWAL";
      const referenceId =
        type === WalletHoldType.BID
          ? (linkedBid?.id ??
            `bid-fallback-${walletIndex + 1}-${holdIndex + 1}`)
          : `withdrawal-ref-${walletIndex + 1}-${holdIndex + 1}`;

      return {
        walletId: wallet.id,
        userId: wallet.userId,
        type,
        status,
        amount: toDecimal(amount),
        referenceType,
        referenceId,
        reason: `Seed hold ${holdIndex + 1}`,
        expiresAt: status === WalletHoldStatus.ACTIVE ? addDays(now, 2) : null,
        releasedAt: status === WalletHoldStatus.RELEASED ? now : null,
        capturedAt: status === WalletHoldStatus.CAPTURED ? now : null,
        cancelledAt: status === WalletHoldStatus.CANCELLED ? now : null,
      };
    }),
  );

  if (data.length > 0) {
    await prisma.walletHold.createMany({
      data,
    });
  }

  return data.length;
}

async function seedLedgerEntries(prisma: PrismaClient, wallets: WalletLite[]) {
  await prisma.walletLedgerEntry.deleteMany();

  const data = wallets.flatMap((wallet, walletIndex) =>
    Array.from({ length: 4 }).map((_, entryIndex) => {
      const type = getLedgerType(walletIndex * 4 + entryIndex);
      const direction = getLedgerDirection(type);
      const amountNumber = 90_000 + entryIndex * 60_000 + walletIndex * 20_000;

      const balanceBase = 2_000_000 + walletIndex * 300_000;
      const sign = direction === WalletLedgerDirection.CREDIT ? 1 : -1;
      const balanceAfter = balanceBase + sign * amountNumber;
      const lockedAfter = 100_000 + (walletIndex % 5) * 20_000;

      return {
        walletId: wallet.id,
        userId: wallet.userId,
        direction,
        type,
        amount: toDecimal(amountNumber),
        balanceAfter: toDecimal(Math.max(balanceAfter, 0)),
        lockedAfter: toDecimal(lockedAfter),
        referenceType: type.includes("WITHDRAWAL") ? "WITHDRAWAL" : "AUCTION",
        referenceId: `ref-${walletIndex + 1}-${entryIndex + 1}`,
        idempotencyKey: `idem-${walletIndex + 1}-${entryIndex + 1}`,
        note: `Seed ledger ${type}`,
      };
    }),
  );

  if (data.length > 0) {
    await prisma.walletLedgerEntry.createMany({
      data,
    });
  }

  return data.length;
}

export async function seedWalletDomain(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      email: "asc",
    },
    take: 15,
  });

  if (users.length === 0) {
    throw new Error("No users found. Please seed users first.");
  }

  const wallets = await seedWallets(prisma, users);
  const depositCount = await seedDepositOrders(prisma, wallets);
  const withdrawalCount = await seedWithdrawalRequests(prisma, wallets);
  const holdCount = await seedWalletHolds(prisma, wallets);
  const ledgerCount = await seedLedgerEntries(prisma, wallets);

  console.log(
    `✅ Seeded wallet domain: ${wallets.length} wallets, ${ledgerCount} ledger entries, ${holdCount} holds, ${depositCount} deposits, ${withdrawalCount} withdrawals`,
  );
}
