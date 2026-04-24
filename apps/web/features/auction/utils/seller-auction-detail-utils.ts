import type {
  AuctionApiItem,
  AuctionApiStatus,
} from "@/features/auction/types/auction-api";
import type { EditFormState } from "@/features/auction/types/seller-auction-detail";

export function statusLabel(status: AuctionApiStatus): string {
  if (status === "DRAFT") {
    return "Nháp";
  }

  if (status === "UPCOMING") {
    return "Sắp diễn ra";
  }

  if (status === "LIVE") {
    return "Đang diễn ra";
  }

  if (status === "ENDED") {
    return "Đã kết thúc";
  }

  return "Đã hủy";
}

export function statusBadgeClass(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "bg-theme-brand text-theme-brand-foreground";
  }

  if (status === "DRAFT") {
    return "border border-theme-line theme-muted";
  }

  if (status === "ENDED") {
    return "border border-theme-line text-theme-body";
  }

  return "border border-theme-line theme-muted";
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Chưa thiết lập";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không hợp lệ";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function toLocalDateTimeInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - timezoneOffset);
  return local.toISOString().slice(0, 16);
}

export function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

export function formatCurrency(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "0 VND";
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

export function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

export function toEditFormState(data: {
  title: string;
  description: string | null;
  startingPrice: string | number;
  buyNowPrice: string | number | null;
  minBidIncrement: string | number;
  startAt?: string | null;
  endAt: string;
  thumbnailUrl: string | null;
  category: { id: string };
}): EditFormState {
  return {
    title: data.title,
    description: data.description ?? "",
    startingPrice: String(data.startingPrice ?? ""),
    buyNowPrice:
      data.buyNowPrice === null || data.buyNowPrice === undefined
        ? ""
        : String(data.buyNowPrice),
    minBidIncrement: String(data.minBidIncrement ?? ""),
    startAt: toLocalDateTimeInput(data.startAt ?? null),
    endAt: toLocalDateTimeInput(data.endAt),
    thumbnailUrl: data.thumbnailUrl ?? "",
    categoryId: data.category.id,
  };
}

export function isHttpUrl(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function sortAuctionImages(
  images: AuctionApiItem["images"] | null | undefined,
): AuctionApiItem["images"] {
  return [...(images ?? [])].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) {
      return a.sortOrder - b.sortOrder;
    }

    return a.isPrimary ? -1 : 1;
  });
}
