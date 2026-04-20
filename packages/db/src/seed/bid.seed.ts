import {
  AuctionStatus,
  BidStatus,
  Prisma,
  PrismaClient,
  UserStatus,
} from "@prisma/client";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function getBidCreatedAt(
  startAt: Date,
  endAt: Date,
  bidIndex: number,
  totalBids: number,
) {
  const startMs = startAt.getTime();
  const endMs = endAt.getTime();
  const step = (endMs - startMs) / (totalBids + 1);

  return new Date(startMs + step * (bidIndex + 1));
}

function buildBidderSequence(bidderIds: string[], totalBids: number): string[] {
  if (!bidderIds.length) return [];

  const sequence: string[] = [];
  let previousBidderId: string | null = null;

  for (let i = 0; i < totalBids; i++) {
    const candidates =
      bidderIds.length === 1
        ? bidderIds
        : bidderIds.filter((id) => id !== previousBidderId);

    const chosen =
      candidates[randomInt(0, candidates.length - 1)] ??
      bidderIds[randomInt(0, bidderIds.length - 1)];

    sequence.push(chosen);
    previousBidderId = chosen;
  }

  return sequence;
}

function getBidStatuses(
  auctionStatus: AuctionStatus,
  totalBids: number,
): BidStatus[] {
  const statuses: BidStatus[] = Array.from(
    { length: totalBids },
    () => BidStatus.VALID,
  );

  if (totalBids === 0) return statuses;

  if (auctionStatus === AuctionStatus.LIVE) {
    if (totalBids >= 2) {
      statuses[totalBids - 2] = BidStatus.OUTBID;
    }
    statuses[totalBids - 1] = BidStatus.WINNING;
    return statuses;
  }

  if (auctionStatus === AuctionStatus.ENDED) {
    for (let i = 0; i < totalBids - 1; i++) {
      statuses[i] = BidStatus.LOST;
    }

    if (totalBids >= 2) {
      statuses[totalBids - 2] = BidStatus.OUTBID;
    }

    statuses[totalBids - 1] = BidStatus.WON;
    return statuses;
  }

  return statuses;
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
        code: true,
        sellerId: true,
        startingPrice: true,
        minBidIncrement: true,
        startAt: true,
        endAt: true,
        status: true,
      },
      orderBy: {
        code: "asc",
      },
    }),
    prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    }),
  ]);

  for (const auction of auctions) {
    const eligibleBidders = users.filter(
      (user) => user.id !== auction.sellerId,
    );

    await prisma.bid.deleteMany({
      where: { auctionId: auction.id },
    });

    if (!eligibleBidders.length) {
      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          currentPrice: auction.startingPrice,
        },
      });
      continue;
    }

    const totalBids = randomInt(5, 15);
    const bidderIds = shuffleArray(eligibleBidders.map((user) => user.id));
    const bidderSequence = buildBidderSequence(bidderIds, totalBids);
    const bidStatuses = getBidStatuses(auction.status, totalBids);

    const startAt =
      auction.startAt ??
      new Date(auction.endAt.getTime() - 24 * 60 * 60 * 1000);

    let currentAmount = new Prisma.Decimal(auction.startingPrice);
    const bidsData: Prisma.BidCreateManyInput[] = [];

    for (let i = 0; i < totalBids; i++) {
      const bidderId = bidderSequence[i];
      const incrementMultiplier = randomInt(1, 4);
      const increment = auction.minBidIncrement.mul(incrementMultiplier);

      currentAmount = currentAmount.add(increment);

      bidsData.push({
        auctionId: auction.id,
        bidderId,
        amount: currentAmount,
        status: bidStatuses[i],
        createdAt: getBidCreatedAt(startAt, auction.endAt, i, totalBids),
      });
    }

    await prisma.bid.createMany({
      data: bidsData,
    });

    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        currentPrice: currentAmount,
      },
    });
  }

  console.log(`✅ Seeded bids for ${auctions.length} auctions`);
}
