export const AUCTION_LIFECYCLE_QUEUE_NAME = "auction-lifecycle";

export const AUCTION_LIFECYCLE_END_JOB = "auction-lifecycle.end";

export const AUCTION_LIFECYCLE_START_JOB = "auction-lifecycle.start";

export type EndAuctionJobData = {
  version: 1;
  auctionId: string;
};

export type StartAuctionJobData = {
  version: 1;
  auctionId: string;
};

export type AuctionLifeCycleJobData = StartAuctionJobData | EndAuctionJobData;

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

export function buildStartAuctionJobId(auctionId: string): string {
  return `auction:start:${auctionId}`;
}

export function isStartAuctionJobData(
  value: unknown,
): value is StartAuctionJobData {
  if (!value || typeof value !== "object") return false;

  const data = value as Record<string, unknown>;

  return data.version === 1 && typeof data.auctionId === "string";
}
