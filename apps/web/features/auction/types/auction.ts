export type AuctionSummary = {
  id: string;
  title: string;
  category: string;
  currentBid: string;
  startingPrice: string;
  timeEnd: string;
  bidCount: number;
  status: "Đang diễn ra" | "Sắp tới" | "Sắp hết" | "Đã kết thúc";
  seller: string;
  imageUrl: string;
};

export type AuctionCategory = {
  slug: string;
  label: string;
  count: number;
};

export type AuctionFeature = {
  title: string;
  description: string;
};

export type AuctionFaq = {
  question: string;
  answer: string;
};

export type LiveBidEvent = {
  bidder: string;
  amount: string;
  time: string;
};
