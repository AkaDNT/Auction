import { PrismaClient } from "@prisma/client";

export async function seedAuctionImages(prisma: PrismaClient) {
  const auctions = await prisma.auction.findMany({
    select: { id: true, code: true },
    orderBy: { code: "asc" },
  });

  for (const [index, auction] of auctions.entries()) {
    const totalImages = 3 + (index % 3); // 3 → 5 images

    // clear old (idempotent)
    await prisma.auctionImage.deleteMany({
      where: { auctionId: auction.id },
    });

    const images = Array.from({ length: totalImages }).map((_, i) => ({
      auctionId: auction.id,
      imageUrl: `https://picsum.photos/seed/${auction.code}-${i}/800/600`,
      altText: `Image ${i + 1} of ${auction.code}`,
      sortOrder: i,
      isPrimary: i === 0,
    }));

    await prisma.auctionImage.createMany({
      data: images,
    });
  }

  console.log(`✅ Seeded auction images for ${auctions.length} auctions`);
}
