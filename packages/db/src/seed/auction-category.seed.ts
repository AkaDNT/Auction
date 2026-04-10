import { PrismaClient } from "@prisma/client";

export async function seedAuctionCategories(prisma: PrismaClient) {
  const categories = [
    {
      slug: "electronics",
      label: "Electronics",
      description: "Phones, laptops, tablets, and gadgets",
    },
    {
      slug: "fashion",
      label: "Fashion",
      description: "Clothes, shoes, bags, and accessories",
    },
    {
      slug: "collectibles",
      label: "Collectibles",
      description: "Figures, cards, rare items, and memorabilia",
    },
    {
      slug: "home-living",
      label: "Home & Living",
      description: "Furniture, kitchenware, and home products",
    },
    {
      slug: "sports",
      label: "Sports",
      description: "Sports equipment and fitness accessories",
    },
    {
      slug: "beauty",
      label: "Beauty",
      description: "Beauty and personal care products",
    },
    {
      slug: "books",
      label: "Books",
      description: "Books, novels, comics, and magazines",
    },
    {
      slug: "toys",
      label: "Toys",
      description: "Toys, games, and entertainment products",
    },
    {
      slug: "automotive",
      label: "Automotive",
      description: "Vehicle accessories and maintenance tools",
    },
    {
      slug: "art",
      label: "Art",
      description: "Artwork, handmade products, and decor",
    },
  ];

  for (const category of categories) {
    await prisma.auctionCategory.upsert({
      where: { slug: category.slug },
      update: {
        label: category.label,
        description: category.description,
      },
      create: category,
    });
  }

  console.log(`✅ Seeded ${categories.length} auction categories`);
}
