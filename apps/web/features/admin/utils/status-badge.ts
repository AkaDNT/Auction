/**
 * Status Badge Utility
 * SOLID: Single Responsibility - provides status styling
 */

import type { AuctionStatus, BidStatus } from "@/features/admin/types";

export function getAuctionStatusLabel(status: AuctionStatus): string {
  const labels: Record<AuctionStatus, string> = {
    DRAFT: "Nháp",
    UPCOMING: "Sắp diễn ra",
    LIVE: "Đang diễn ra",
    ENDED: "Đã kết thúc",
    CANCELLED: "Đã hủy",
  };
  return labels[status] || status;
}

export function getAuctionStatusColor(status: AuctionStatus): string {
  const colors: Record<AuctionStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    UPCOMING: "bg-blue-100 text-blue-800",
    LIVE: "bg-green-100 text-green-800",
    ENDED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getBidStatusLabel(status: BidStatus): string {
  const labels: Record<BidStatus, string> = {
    ACTIVE: "Hoạt động",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
    PENDING: "Chờ duyệt",
  };
  return labels[status] || status;
}

export function getBidStatusColor(status: BidStatus): string {
  const colors: Record<BidStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-yellow-100 text-yellow-800",
    PENDING: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
