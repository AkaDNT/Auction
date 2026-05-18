import { PrismaClient } from "@prisma/client";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function seedRefreshTokens(prisma: PrismaClient) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
    orderBy: {
      email: "asc",
    },
    take: 12,
  });

  await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        {
          tokenHash: {
            startsWith: "seed-active-",
          },
        },
        {
          tokenHash: {
            startsWith: "seed-revoked-",
          },
        },
      ],
    },
  });

  const now = new Date();

  const tokens = users.flatMap((user, userIndex) => {
    const activeTokenCount = (userIndex % 2) + 1;

    const activeTokens = Array.from({ length: activeTokenCount }).map(
      (_, tokenIndex) => ({
        userId: user.id,
        tokenHash: `seed-active-${userIndex + 1}-${tokenIndex + 1}`,
        revokedAt: null,
        expiresAt: addDays(now, 7 + tokenIndex),
      }),
    );

    const revokedToken = {
      userId: user.id,
      tokenHash: `seed-revoked-${userIndex + 1}`,
      revokedAt: addDays(now, -1),
      expiresAt: addDays(now, 2),
    };

    return [...activeTokens, revokedToken];
  });

  if (tokens.length > 0) {
    await prisma.refreshToken.createMany({
      data: tokens,
    });
  }

  console.log(`✅ Seeded ${tokens.length} refresh tokens`);
}
