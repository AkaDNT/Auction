export type AuctionApiStatus =
  | "DRAFT"
  | "UPCOMING"
  | "LIVE"
  | "ENDED"
  | "CANCELLED";

export type AuctionEndTimeFilter =
  | "ALL"
  | "WITHIN_1_HOUR"
  | "TODAY"
  | "THIS_WEEK";

export type AuctionPriceRangeFilter =
  | "ALL"
  | "BELOW_1M"
  | "FROM_1M_TO_5M"
  | "ABOVE_5M";

export type AuctionSortBy =
  | "NEWEST"
  | "ENDING_SOON"
  | "HIGHEST_PRICE"
  | "LOWEST_PRICE";

export type AuctionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: AuctionApiStatus;
  sellerSlug?: string;
  endTimeFilter?: AuctionEndTimeFilter;
  priceRangeFilter?: AuctionPriceRangeFilter;
  sortBy?: AuctionSortBy;
};

export type AuctionApiCategory = {
  id: string;
  slug: string;
  label: string;
};

type AuctionApiSeller = {
  id: string;
  name: string | null;
  email: string;
};

type AuctionApiImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  storageKey: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type AuctionApiItem = {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string | null;
  endAt: string;
  status: AuctionApiStatus;
  startingPrice: string | number;
  buyNowPrice: string | number | null;
  minBidIncrement: string | number;
  currentPrice: string | number | null;
  thumbnailUrl: string | null;
  category: AuctionApiCategory;
  seller: AuctionApiSeller;
  images: AuctionApiImage[];
  _count: {
    bids: number;
  };
};

export type AuctionListResponse = {
  items: AuctionApiItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};
