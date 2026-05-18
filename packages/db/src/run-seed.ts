import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seed/users.seed";
import { seedRefreshTokens } from "./seed/auth.seed";
import { seedAuctionCategories } from "./seed/auction-category.seed";
import { seedAuctions } from "./seed/auction.seed";
import { seedAuctionContents } from "./seed/auction-content.seed";
import { seedAuctionImages } from "./seed/auction-image.seed";
import { seedBids } from "./seed/bid.seed";
import { seedAuctionSettlements } from "./seed/auction-settlements.seed";
import { seedUploadAssets } from "./seed/upload-asset.seed";
import { seedWalletDomain } from "./seed/wallet.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  await seedUsers(prisma);
  await seedRefreshTokens(prisma);
  await seedUploadAssets(prisma);
  await seedAuctionCategories(prisma);
  await seedAuctionContents(prisma);
  await seedAuctions(prisma);
  await seedAuctionImages(prisma);
  await seedBids(prisma);
  await seedWalletDomain(prisma);
  await seedAuctionSettlements(prisma);

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
