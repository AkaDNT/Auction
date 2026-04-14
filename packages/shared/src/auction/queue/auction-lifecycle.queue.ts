export const AUCTION_LIFECYCLE_QUEUE_NAME = "auction-lifecycle";

export const AUCTION_LIFECYCLE_END_JOB = "auction-lifecycle.end";

export type EndAuctionJobData = {
  version: 1;
  auctionId: string;
};

export function buildEndAuctionJobId(auctionId: string): string {
  return `auction:end:${auctionId}`;
}

export function isEndAuctionJobData(
  value: unknown,
): value is EndAuctionJobData {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  return data.version === 1 && typeof data.auctionId === "string";
}
