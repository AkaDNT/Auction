import { AuctionStatus, PrismaClient } from "@prisma/client";

const SETTLEMENT_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export async function seedAuctionSettlements(prisma: PrismaClient) {
  const auctions = await prisma.auction.findMany({
    select: {
      id: true,
      code: true,
      status: true,
      currentPrice: true,
    },
    orderBy: {
      code: "asc",
    },
  });

  for (const auction of auctions) {
    const highestBid = await prisma.bid.findFirst({
      where: {
        auctionId: auction.id,
      },
      orderBy: [{ amount: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        bidderId: true,
        amount: true,
      },
    });

    if (auction.status === AuctionStatus.ENDED) {
      await prisma.auctionSettlement.upsert({
        where: {
          auctionId: auction.id,
        },
        update: {
          winnerUserId: highestBid?.bidderId ?? null,
          winningBidId: highestBid?.id ?? null,
          finalAmount: highestBid?.amount ?? auction.currentPrice ?? null,
          status: SETTLEMENT_STATUS.COMPLETED as any,
          processedAt: new Date(),
          failureReason: null,
        },
        create: {
          auctionId: auction.id,
          winnerUserId: highestBid?.bidderId ?? null,
          winningBidId: highestBid?.id ?? null,
          finalAmount: highestBid?.amount ?? auction.currentPrice ?? null,
          status: SETTLEMENT_STATUS.COMPLETED as any,
          processedAt: new Date(),
          failureReason: null,
        },
      });

      continue;
    }

    if (auction.status === AuctionStatus.LIVE) {
      await prisma.auctionSettlement.upsert({
        where: {
          auctionId: auction.id,
        },
        update: {
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: SETTLEMENT_STATUS.PENDING as any,
          processedAt: null,
          failureReason: null,
        },
        create: {
          auctionId: auction.id,
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: SETTLEMENT_STATUS.PENDING as any,
          processedAt: null,
          failureReason: null,
        },
      });

      continue;
    }

    if (auction.status === AuctionStatus.CANCELLED) {
      await prisma.auctionSettlement.upsert({
        where: {
          auctionId: auction.id,
        },
        update: {
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: SETTLEMENT_STATUS.FAILED as any,
          processedAt: new Date(),
          failureReason: "Auction was cancelled",
        },
        create: {
          auctionId: auction.id,
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: SETTLEMENT_STATUS.FAILED as any,
          processedAt: new Date(),
          failureReason: "Auction was cancelled",
        },
      });

      continue;
    }

    await prisma.auctionSettlement.deleteMany({
      where: {
        auctionId: auction.id,
      },
    });
  }

  console.log(`✅ Seeded auction settlements for ${auctions.length} auctions`);
}
