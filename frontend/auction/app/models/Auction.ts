export interface PageResult<T> {
  results: T[];
  pageCount: number;
  totalCount: number;
}

export interface Auction {
  id: string;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  seller: string;
  winner?: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  imageUrl: string;
  status: string;
  reservePrice: number;
  soldAmount: number;
  currentHighBid: number;
}
