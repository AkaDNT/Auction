import {
  PrismaClient,
  UploadAssetScope,
  UploadAssetStatus,
} from "@prisma/client";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export async function seedUploadAssets(prisma: PrismaClient) {
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

  await prisma.uploadAsset.deleteMany();

  const scopes: UploadAssetScope[] = [
    UploadAssetScope.AUCTION_THUMBNAIL,
    UploadAssetScope.AUCTION_IMAGE,
    UploadAssetScope.USER_AVATAR,
  ];

  const statuses: UploadAssetStatus[] = [
    UploadAssetStatus.PENDING,
    UploadAssetStatus.READY,
    UploadAssetStatus.CONSUMED,
    UploadAssetStatus.EXPIRED,
  ];

  const now = new Date();

  const assets = users.flatMap((user, userIndex) =>
    Array.from({ length: 4 }).map((_, index) => {
      const status = statuses[(userIndex + index) % statuses.length];
      const scope = scopes[(userIndex + index) % scopes.length];

      return {
        ownerId: user.id,
        storageKey: `seed-assets/${user.id}/${scope.toLowerCase()}-${index + 1}.jpg`,
        fileUrl: `https://picsum.photos/seed/${encodeURIComponent(`asset-${userIndex + 1}-${index + 1}`)}/1280/960`,
        fileName: `${scope.toLowerCase()}-${index + 1}.jpg`,
        contentType: "image/jpeg",
        scope,
        status,
        usedAt: status === UploadAssetStatus.CONSUMED ? addDays(now, -1) : null,
        expiresAt:
          status === UploadAssetStatus.EXPIRED
            ? addDays(now, -1)
            : addDays(now, 15 + index),
      };
    }),
  );

  if (assets.length > 0) {
    await prisma.uploadAsset.createMany({
      data: assets,
    });
  }

  console.log(`✅ Seeded ${assets.length} upload assets`);
}
