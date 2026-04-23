/*
  Warnings:

  - You are about to drop the `AuctionUploadAsset` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UploadAssetStatus" AS ENUM ('PENDING', 'READY', 'CONSUMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "UploadAssetScope" AS ENUM ('AUCTION_THUMBNAIL', 'AUCTION_IMAGE', 'USER_AVATAR');

-- DropForeignKey
ALTER TABLE "AuctionUploadAsset" DROP CONSTRAINT "AuctionUploadAsset_ownerId_fkey";

-- DropTable
DROP TABLE "AuctionUploadAsset";

-- DropEnum
DROP TYPE "AuctionUploadAssetStatus";

-- CreateTable
CREATE TABLE "UploadAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "scope" "UploadAssetScope" NOT NULL,
    "status" "UploadAssetStatus" NOT NULL DEFAULT 'PENDING',
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadAsset_storageKey_key" ON "UploadAsset"("storageKey");

-- CreateIndex
CREATE INDEX "UploadAsset_ownerId_idx" ON "UploadAsset"("ownerId");

-- CreateIndex
CREATE INDEX "UploadAsset_scope_idx" ON "UploadAsset"("scope");

-- CreateIndex
CREATE INDEX "UploadAsset_status_idx" ON "UploadAsset"("status");

-- CreateIndex
CREATE INDEX "UploadAsset_expiresAt_idx" ON "UploadAsset"("expiresAt");

-- AddForeignKey
ALTER TABLE "UploadAsset" ADD CONSTRAINT "UploadAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
