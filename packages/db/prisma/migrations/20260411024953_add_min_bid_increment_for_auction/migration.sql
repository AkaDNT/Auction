-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "minBidIncrement" DECIMAL(18,3) NOT NULL DEFAULT 1000;
