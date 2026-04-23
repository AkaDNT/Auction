import type {
  AuctionApiStatus,
  AuctionEndTimeFilter,
  AuctionPriceRangeFilter,
  AuctionSortBy,
} from "@/features/auction/types/auction-api";

export const sortOptions: Array<{ label: string; value: AuctionSortBy }> = [
  { label: "Mới nhất", value: "NEWEST" },
  { label: "Sắp kết thúc", value: "ENDING_SOON" },
  { label: "Giá từ cao đến thấp", value: "HIGHEST_PRICE" },
  { label: "Giá từ thấp đến cao", value: "LOWEST_PRICE" },
];

export const statusOptions: Array<{ label: string; value: AuctionApiStatus }> =
  [
    { label: "Đang diễn ra", value: "LIVE" },
    { label: "Sắp tới", value: "UPCOMING" },
    { label: "Đã kết thúc", value: "ENDED" },
    { label: "Đã hủy", value: "CANCELLED" },
  ];

export const endTimeFilterOptions: Array<{
  label: string;
  value: AuctionEndTimeFilter;
}> = [
  { label: "Mọi mốc thời gian", value: "ALL" },
  { label: "Trong 1 giờ tới", value: "WITHIN_1_HOUR" },
  { label: "Trong ngày hôm nay", value: "TODAY" },
  { label: "Tuần này", value: "THIS_WEEK" },
];

export const priceRangeOptions: Array<{
  label: string;
  value: AuctionPriceRangeFilter;
}> = [
  { label: "Tất cả mức giá", value: "ALL" },
  { label: "Dưới 1,000,000", value: "BELOW_1M" },
  { label: "Từ 1,000,000 đến 5,000,000", value: "FROM_1M_TO_5M" },
  { label: "Trên 5,000,000", value: "ABOVE_5M" },
];

export const AUCTIONS_PER_PAGE = 12;

export type NavigatorConnection = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};
