export class BidPlacedEventDto {
  auctionId!: string;
  bidderId!: string;
  bidderSlug!: string;
  amount!: number;
  placedAt!: string;
}
