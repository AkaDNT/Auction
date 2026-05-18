CREATE UNIQUE INDEX "unique_winning_bid_per_auction"
ON "Bid" ("auctionId")
WHERE "status" = 'WINNING';

CREATE UNIQUE INDEX "unique_active_bid_hold_per_user_auction"
ON "WalletHold" ("userId", "referenceType", "referenceId", "type")
WHERE "status" = 'ACTIVE';

ALTER TABLE "Wallet"
ADD CONSTRAINT "wallet_balance_non_negative"
CHECK ("balance" >= 0);

ALTER TABLE "Wallet"
ADD CONSTRAINT "wallet_locked_balance_non_negative"
CHECK ("lockedBalance" >= 0);

ALTER TABLE "Wallet"
ADD CONSTRAINT "wallet_locked_balance_not_exceed_balance"
CHECK ("lockedBalance" <= "balance");