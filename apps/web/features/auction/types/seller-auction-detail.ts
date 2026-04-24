export type EditFormState = {
  title: string;
  description: string;
  startingPrice: string;
  buyNowPrice: string;
  minBidIncrement: string;
  startAt: string;
  endAt: string;
  thumbnailUrl: string;
  categoryId: string;
};

export type SellerAuctionConfirmAction = "cancel" | "delete" | null;

export type SellerAuctionActiveAction =
  | "publish"
  | "cancel"
  | "delete"
  | "edit"
  | null;

export type SellerAuctionImageAction =
  | "upload"
  | "set-primary"
  | "sort"
  | "delete"
  | null;
