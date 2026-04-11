"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const users_seed_1 = require("./seed/users.seed");
const auction_category_seed_1 = require("./seed/auction-category.seed");
const auction_seed_1 = require("./seed/auction.seed");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Start seeding...");
    await (0, users_seed_1.seedUsers)(prisma);
    await (0, auction_category_seed_1.seedAuctionCategories)(prisma);
    await (0, auction_seed_1.seedAuctions)(prisma);
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
