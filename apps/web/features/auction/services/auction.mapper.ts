import { getAuctionImage } from "@/shared/lib/mock-images";
import type {
  AuctionApiItem,
  AuctionApiStatus,
} from "@/features/auction/types/auction-api";
import type { AuctionSummary } from "@/features/auction/types/auction";

function getDisplayStatus(
  status: AuctionApiStatus,
  endAt: string,
): AuctionSummary["status"] {
  if (status === "CANCELLED") {
    return "Đã hủy";
  }

  if (status === "ENDED") {
    return "Đã kết thúc";
  }

  if (status === "UPCOMING" || status === "DRAFT") {
    return "Sắp tới";
  }

  const remainingMs = new Date(endAt).getTime() - Date.now();
  if (remainingMs > 0 && remainingMs <= 60 * 60 * 1000) {
    return "Sắp hết";
  }

  return "Đang diễn ra";
}

function toCurrencyLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "0 VND";
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(numericValue)} VND`;
}

function getPreferredAuctionImage(
  images: AuctionApiItem["images"],
): string | undefined {
  if (!images.length) {
    return undefined;
  }

  const sortedImages = [...images].sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) {
      return left.isPrimary ? -1 : 1;
    }

    return left.sortOrder - right.sortOrder;
  });

  return sortedImages[0]?.imageUrl;
}

export function mapAuctionApiItemToSummary(
  auction: AuctionApiItem,
): AuctionSummary {
  const imageFromList = getPreferredAuctionImage(auction.images);
  const imageUrl =
    imageFromList ?? auction.thumbnailUrl ?? getAuctionImage(auction.id);

  return {
    id: auction.id,
    title: auction.title,
    category: auction.category.label,
    currentBid: toCurrencyLabel(auction.currentPrice ?? auction.startingPrice),
    startingPrice: toCurrencyLabel(auction.startingPrice),
    timeEnd: auction.endAt,
    bidCount: auction._count.bids,
    status: getDisplayStatus(auction.status, auction.endAt),
    seller: auction.seller.name ?? auction.seller.email,
    imageUrl,
  };
}
