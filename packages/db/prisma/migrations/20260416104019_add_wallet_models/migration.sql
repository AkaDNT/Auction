-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "WalletLedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "WalletLedgerType" AS ENUM ('DEPOSIT_SETTLED', 'WITHDRAWAL_REQUEST_CREATED', 'WITHDRAWAL_COMPLETED', 'WITHDRAWAL_REJECTED_REFUND', 'BID_HOLD_CAPTURED', 'BID_HOLD_RELEASED_ADJUSTMENT', 'ADMIN_ADJUSTMENT_CREDIT', 'ADMIN_ADJUSTMENT_DEBIT');

-- CreateEnum
CREATE TYPE "WalletHoldType" AS ENUM ('BID', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "WalletHoldStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CAPTURED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DepositProvider" AS ENUM ('MOMO', 'VNPAY', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuctionSettlementStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BidStatus" ADD VALUE 'OUTBID';
ALTER TYPE "BidStatus" ADD VALUE 'WINNING';
ALTER TYPE "BidStatus" ADD VALUE 'WON';
ALTER TYPE "BidStatus" ADD VALUE 'LOST';

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "holdId" TEXT;

-- CreateTable
CREATE TABLE "AuctionSettlement" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "winnerUserId" TEXT,
    "winningBidId" TEXT,
    "finalAmount" DECIMAL(18,3),
    "status" "AuctionSettlementStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "WalletStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "lockedBalance" DECIMAL(18,3) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletLedgerEntry" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "direction" "WalletLedgerDirection" NOT NULL,
    "type" "WalletLedgerType" NOT NULL,
    "amount" DECIMAL(18,3) NOT NULL,
    "balanceAfter" DECIMAL(18,3) NOT NULL,
    "lockedAfter" DECIMAL(18,3) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletHold" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "WalletHoldType" NOT NULL,
    "status" "WalletHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "amount" DECIMAL(18,3) NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "WalletHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositOrder" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "DepositProvider" NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "internalCode" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerTxnId" TEXT,
    "paymentUrl" TEXT,
    "qrContent" TEXT,
    "rawPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(18,3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "bankCode" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT NOT NULL,
    "bankAccountName" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "externalTransferId" TEXT,
    "note" TEXT,
    "rejectReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionSettlement_auctionId_key" ON "AuctionSettlement"("auctionId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_status_idx" ON "Wallet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WalletLedgerEntry_idempotencyKey_key" ON "WalletLedgerEntry"("idempotencyKey");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_walletId_createdAt_idx" ON "WalletLedgerEntry"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_userId_createdAt_idx" ON "WalletLedgerEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletLedgerEntry_referenceType_referenceId_idx" ON "WalletLedgerEntry"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "WalletHold_walletId_status_idx" ON "WalletHold"("walletId", "status");

-- CreateIndex
CREATE INDEX "WalletHold_userId_status_idx" ON "WalletHold"("userId", "status");

-- CreateIndex
CREATE INDEX "WalletHold_referenceType_referenceId_idx" ON "WalletHold"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "WalletHold_type_status_idx" ON "WalletHold"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DepositOrder_internalCode_key" ON "DepositOrder"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "DepositOrder_providerOrderId_key" ON "DepositOrder"("providerOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "DepositOrder_providerTxnId_key" ON "DepositOrder"("providerTxnId");

-- CreateIndex
CREATE INDEX "DepositOrder_userId_status_idx" ON "DepositOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "DepositOrder_walletId_status_idx" ON "DepositOrder"("walletId", "status");

-- CreateIndex
CREATE INDEX "DepositOrder_provider_status_idx" ON "DepositOrder"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_internalCode_key" ON "WithdrawalRequest"("internalCode");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_externalTransferId_key" ON "WithdrawalRequest"("externalTransferId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_status_idx" ON "WithdrawalRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_walletId_status_idx" ON "WithdrawalRequest"("walletId", "status");

-- AddForeignKey
ALTER TABLE "AuctionSettlement" ADD CONSTRAINT "AuctionSettlement_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedgerEntry" ADD CONSTRAINT "WalletLedgerEntry_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletLedgerEntry" ADD CONSTRAINT "WalletLedgerEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletHold" ADD CONSTRAINT "WalletHold_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletHold" ADD CONSTRAINT "WalletHold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositOrder" ADD CONSTRAINT "DepositOrder_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositOrder" ADD CONSTRAINT "DepositOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
