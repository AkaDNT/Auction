import {
  AuctionSettlementStatus,
  AuctionStatus,
  PrismaClient,
} from "@prisma/client";

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

  for (const [auctionIndex, auction] of auctions.entries()) {
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
          status: AuctionSettlementStatus.COMPLETED,
          processedAt: new Date(),
          failureReason: null,
        },
        create: {
          auctionId: auction.id,
          winnerUserId: highestBid?.bidderId ?? null,
          winningBidId: highestBid?.id ?? null,
          finalAmount: highestBid?.amount ?? auction.currentPrice ?? null,
          status: AuctionSettlementStatus.COMPLETED,
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
          status:
            auctionIndex % 2 === 0
              ? AuctionSettlementStatus.PROCESSING
              : AuctionSettlementStatus.PENDING,
          processedAt: auctionIndex % 2 === 0 ? new Date() : null,
          failureReason: null,
        },
        create: {
          auctionId: auction.id,
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status:
            auctionIndex % 2 === 0
              ? AuctionSettlementStatus.PROCESSING
              : AuctionSettlementStatus.PENDING,
          processedAt: auctionIndex % 2 === 0 ? new Date() : null,
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
          status: AuctionSettlementStatus.FAILED,
          processedAt: new Date(),
          failureReason: "Auction was cancelled",
        },
        create: {
          auctionId: auction.id,
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: AuctionSettlementStatus.FAILED,
          processedAt: new Date(),
          failureReason: "Auction was cancelled",
        },
      });

      continue;
    }

    if (auction.status === AuctionStatus.UPCOMING) {
      await prisma.auctionSettlement.upsert({
        where: {
          auctionId: auction.id,
        },
        update: {
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: AuctionSettlementStatus.PENDING,
          processedAt: null,
          failureReason: null,
        },
        create: {
          auctionId: auction.id,
          winnerUserId: null,
          winningBidId: null,
          finalAmount: null,
          status: AuctionSettlementStatus.PENDING,
          processedAt: null,
          failureReason: null,
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
