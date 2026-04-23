-- CreateEnum
CREATE TYPE "AuctionUploadAssetStatus" AS ENUM ('PENDING', 'READY', 'CONSUMED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AuctionUploadAsset" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "status" "AuctionUploadAssetStatus" NOT NULL DEFAULT 'PENDING',
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionUploadAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionUploadAsset_storageKey_key" ON "AuctionUploadAsset"("storageKey");

-- CreateIndex
CREATE INDEX "AuctionUploadAsset_ownerId_idx" ON "AuctionUploadAsset"("ownerId");

-- CreateIndex
CREATE INDEX "AuctionUploadAsset_status_idx" ON "AuctionUploadAsset"("status");

-- CreateIndex
CREATE INDEX "AuctionUploadAsset_expiresAt_idx" ON "AuctionUploadAsset"("expiresAt");

-- AddForeignKey
ALTER TABLE "AuctionUploadAsset" ADD CONSTRAINT "AuctionUploadAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
