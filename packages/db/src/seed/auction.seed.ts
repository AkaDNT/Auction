import { AuctionStatus, Prisma, PrismaClient, Role } from "@prisma/client";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getAuctionStatus(index: number): AuctionStatus {
  const statuses = [
    AuctionStatus.DRAFT,
    AuctionStatus.UPCOMING,
    AuctionStatus.LIVE,
    AuctionStatus.ENDED,
    AuctionStatus.CANCELLED,
  ];

  return statuses[index % statuses.length];
}

function getAuctionSchedule(status: AuctionStatus, index: number) {
  const now = new Date();

  switch (status) {
    case AuctionStatus.DRAFT:
      return {
        startAt: null,
        endAt: addDays(now, 15 + (index % 10)),
      };

    case AuctionStatus.UPCOMING: {
      const startAt = addDays(now, 1 + (index % 7));
      const endAt = addDays(startAt, 5 + (index % 3));
      return { startAt, endAt };
    }

    case AuctionStatus.LIVE: {
      const startAt = addDays(now, -((index % 3) + 1));
      const endAt = addDays(now, 2 + (index % 5));
      return { startAt, endAt };
    }

    case AuctionStatus.ENDED: {
      const startAt = addDays(now, -10 - (index % 5));
      const endAt = addDays(now, -1 - (index % 3));
      return { startAt, endAt };
    }

    case AuctionStatus.CANCELLED: {
      const startAt = addDays(now, -2 - (index % 3));
      const endAt = addDays(now, 2 + (index % 4));
      return { startAt, endAt };
    }

    default:
      return {
        startAt: null,
        endAt: addDays(now, 30),
      };
  }
}

export async function seedAuctions(prisma: PrismaClient) {
  const sellers = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: Role.SELLER,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  const categories = await prisma.auctionCategory.findMany({
    select: {
      id: true,
      slug: true,
      label: true,
    },
    orderBy: {
      slug: "asc",
    },
  });

  if (!sellers.length) {
    throw new Error("No SELLER users found. Please seed users first.");
  }

  if (!categories.length) {
    throw new Error(
      "No auction categories found. Please seed categories first.",
    );
  }

  for (let i = 1; i <= 100; i++) {
    const seller = sellers[(i - 1) % sellers.length];
    const category = categories[(i - 1) % categories.length];
    const status = getAuctionStatus(i);
    const { startAt, endAt } = getAuctionSchedule(status, i);

    const startingPrice = new Prisma.Decimal(1_000_000 + i * 50_000);
    const reservePrice =
      i % 3 === 0 ? null : new Prisma.Decimal(1_200_000 + i * 60_000);
    const buyNowPrice =
      i % 4 === 0 ? null : new Prisma.Decimal(1_800_000 + i * 80_000);

    let currentPrice: Prisma.Decimal | null = null;

    if (status === AuctionStatus.LIVE || status === AuctionStatus.ENDED) {
      currentPrice = new Prisma.Decimal(1_100_000 + i * 55_000);
    }

    const code = `AUC-${String(i).padStart(4, "0")}`;
    const slug = `auction-${String(i).padStart(4, "0")}-${category.slug}`;

    await prisma.auction.upsert({
      where: { code },
      update: {
        title: `${category.label} Auction #${i}`,
        slug,
        description: `Sample auction #${i} in category ${category.label}. Seller: ${seller.name}.`,
        startingPrice,
        reservePrice,
        currentPrice,
        buyNowPrice,
        startAt,
        endAt,
        status,
        sellerId: seller.id,
        categoryId: category.id,
        thumbnailUrl: `https://picsum.photos/seed/auction-${i}/800/600`,
      },
      create: {
        code,
        title: `${category.label} Auction #${i}`,
        slug,
        description: `Sample auction #${i} in category ${category.label}. Seller: ${seller.name}.`,
        startingPrice,
        reservePrice,
        currentPrice,
        buyNowPrice,
        startAt,
        endAt,
        status,
        sellerId: seller.id,
        categoryId: category.id,
        thumbnailUrl: `https://picsum.photos/seed/auction-${i}/800/600`,
      },
    });
  }

  console.log("✅ Seeded 100 auctions");
}
