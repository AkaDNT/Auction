import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seed/users.seed";
import { seedAuctionCategories } from "./seed/auction-category.seed";
import { seedAuctions } from "./seed/auction.seed";
import { seedAuctionImages } from "./seed/auction-image.seed";
import { seedBids } from "./seed/bid.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  await seedUsers(prisma);
  await seedAuctionCategories(prisma);
  await seedAuctions(prisma);
  await seedAuctionImages(prisma);
  await seedBids(prisma);

  console.log("🎉 Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
