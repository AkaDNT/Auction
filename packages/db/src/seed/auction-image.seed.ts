import { PrismaClient } from "@prisma/client";

const CATEGORY_IMAGE_KEYWORDS: Record<string, string[]> = {
  electronics: ["electronics", "gadget", "laptop", "smartphone", "tablet"],
  fashion: ["fashion", "clothes", "shoes", "bag", "watch"],
  collectibles: ["collectible", "figure", "toy", "cards", "memorabilia"],
  "home-living": ["interior", "furniture", "kitchen", "home", "decor"],
  sports: ["sports", "fitness", "bicycle", "badminton", "gym"],
  beauty: ["beauty", "cosmetics", "perfume", "skincare", "makeup"],
  books: ["books", "library", "reading", "novel", "comics"],
  toys: ["toys", "lego", "game", "robot", "doll"],
  automotive: ["car", "automotive", "engine", "dashboard", "garage"],
  art: ["art", "painting", "sculpture", "canvas", "ceramic"],
};

function buildLoremFlickrUrl(keyword: string, lock: number) {
  return `https://loremflickr.com/1200/900/${encodeURIComponent(keyword)}?lock=${lock}`;
}

function buildPicsumFallback(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

function getImageUrl(
  categorySlug: string,
  auctionCode: string,
  imageIndex: number,
  auctionIndex: number,
) {
  const keywords = CATEGORY_IMAGE_KEYWORDS[categorySlug];

  if (!keywords?.length) {
    return buildPicsumFallback(`${auctionCode}-${imageIndex}`);
  }

  const keyword = keywords[(auctionIndex + imageIndex) % keywords.length];
  const lock = 5000 + auctionIndex * 10 + imageIndex;

  return buildLoremFlickrUrl(keyword, lock);
}

export async function seedAuctionImages(prisma: PrismaClient) {
  const auctions = await prisma.auction.findMany({
    select: {
      id: true,
      code: true,
      title: true,
      slug: true,
      category: {
        select: {
          slug: true,
          label: true,
        },
      },
    },
    orderBy: { code: "asc" },
  });

  for (const [auctionIndex, auction] of auctions.entries()) {
    const totalImages = 3 + (auctionIndex % 3); // 3 -> 5 images

    await prisma.auctionImage.deleteMany({
      where: { auctionId: auction.id },
    });

    const images = Array.from({ length: totalImages }).map((_, imageIndex) => ({
      auctionId: auction.id,
      imageUrl: getImageUrl(
        auction.category.slug,
        auction.code,
        imageIndex,
        auctionIndex,
      ),
      altText: `${auction.title} - image ${imageIndex + 1}`,
      sortOrder: imageIndex,
      isPrimary: imageIndex === 0,
    }));

    await prisma.auctionImage.createMany({
      data: images,
    });
  }

  console.log(`✅ Seeded auction images for ${auctions.length} auctions`);
}
