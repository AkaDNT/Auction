import { AuctionStatus, BidStatus, Prisma, PrismaClient } from "@prisma/client";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedBids(prisma: PrismaClient) {
  const [auctions, users] = await Promise.all([
    prisma.auction.findMany({
      where: {
        status: {
          in: [AuctionStatus.LIVE, AuctionStatus.ENDED],
        },
      },
      select: {
        id: true,
        sellerId: true,
        startingPrice: true,
        minBidIncrement: true,
        startAt: true,
        endAt: true,
      },
    }),
    prisma.user.findMany({
      select: { id: true },
    }),
  ]);

  for (const auction of auctions) {
    const bidders = users.filter((u) => u.id !== auction.sellerId);

    const totalBids = randomInt(5, 15);

    let currentAmount = new Prisma.Decimal(auction.startingPrice);

    // clear old
    await prisma.bid.deleteMany({
      where: { auctionId: auction.id },
    });

    const bidsData: Prisma.BidCreateManyInput[] = [];

    for (let i = 0; i < totalBids; i++) {
      const bidder = bidders[randomInt(0, bidders.length - 1)];

      const incrementMultiplier = randomInt(1, 5);
      const increment = auction.minBidIncrement.mul(incrementMultiplier);

      currentAmount = currentAmount.add(increment);

      // time distribution
      const start = auction.startAt ?? new Date();
      const end = auction.endAt;

      const createdAt = new Date(
        start.getTime() +
          ((end.getTime() - start.getTime()) * (i + 1)) / (totalBids + 1),
      );

      bidsData.push({
        auctionId: auction.id,
        bidderId: bidder.id,
        amount: currentAmount,
        status: BidStatus.VALID,
        createdAt,
      });
    }

    await prisma.bid.createMany({
      data: bidsData,
    });

    // update currentPrice = last bid
    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        currentPrice: currentAmount,
      },
    });
  }

  console.log(`✅ Seeded bids for ${auctions.length} auctions`);
}
