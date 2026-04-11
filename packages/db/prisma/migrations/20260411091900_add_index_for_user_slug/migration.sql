/*
  Warnings:

  - Made the column `slug` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE INDEX "User_slug_idx" ON "User"("slug");
