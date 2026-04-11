export type BidRuleInput = {
  startingPrice: number | string | { toString(): string };
  currentPrice: number | string | { toString(): string } | null;
  minBidIncrement: number | string | { toString(): string };
};

export type BidRuleResult = {
  startingPrice: number;
  currentPrice: number | null;
  minBidIncrement: number;
  hasExistingBid: boolean;
  minimumAllowedBid: number;
};

export function calculateMinimumAllowedBid(input: BidRuleInput): BidRuleResult {
  const startingPrice = Number(input.startingPrice);
  const currentPrice =
    input.currentPrice !== null ? Number(input.currentPrice) : null;
  const minBidIncrement = Number(input.minBidIncrement);

  const hasExistingBid = currentPrice !== null;
  const minimumAllowedBid = hasExistingBid
    ? currentPrice + minBidIncrement
    : startingPrice;

  return {
    startingPrice,
    currentPrice,
    minBidIncrement,
    hasExistingBid,
    minimumAllowedBid,
  };
}
