/**
 * Admin Mock Data
 * Used for development and testing
 */

import type {
  AdminAuction,
  AdminCategory,
  AdminAuctionFeature,
  AdminAuctionFaq,
  AdminBid,
} from "@/features/admin/types";

export const mockAdminAuctions: AdminAuction[] = [
  {
    id: "1",
    code: "AUC-0001",
    slug: "rolex-daytona-2024",
    title: "Rolex Daytona 2024",
    description: "Đồng hồ Rolex Daytona chính hãng, tình trạng như mới",
    status: "LIVE",
    startingPrice: 15000,
    buyNowPrice: 25000,
    minBidIncrement: 500,
    imageCount: 3,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    categoryId: "1",
    categoryName: "Đồng hồ",
    sellerId: "seller-1",
    sellerName: "Ngô Thị A",
    sellerEmail: "seller1@example.com",
    currentBidCount: 24,
    currentHighestBid: 18500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "AUC-0002",
    slug: "tesla-model-s-plaid",
    title: "Tesla Model S Plaid",
    description: "Xe điện Tesla Model S Plaid, 2023",
    status: "LIVE",
    startingPrice: 65000,
    minBidIncrement: 1000,
    imageCount: 5,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    categoryId: "2",
    categoryName: "Xe điện",
    sellerId: "seller-2",
    sellerName: "Trần Văn B",
    sellerEmail: "seller2@example.com",
    currentBidCount: 18,
    currentHighestBid: 72000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAdminCategories: AdminCategory[] = [
  {
    id: "1",
    slug: "dong-ho",
    label: "Đồng hồ",
    description: "Các mẫu đồng hồ cao cấp",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "xe-dien",
    label: "Xe điện",
    description: "Phương tiện điện di động",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "nghe-thuat",
    label: "Nghệ thuật",
    description: "Tác phẩm nghệ thuật và điêu khắc",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAdminFeatures: AdminAuctionFeature[] = [
  {
    id: "1",
    name: "Tài trợ",
    description: "Được tài trợ bởi các nhà tài trợ hàng đầu",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Xác thực",
    description: "Xác thực bởi các chuyên gia hàng đầu",
    displayOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAdminFaqs: AdminAuctionFaq[] = [
  {
    id: "1",
    question: "Làm thế nào để bắt đầu đặt giá?",
    answer:
      "Hãy tìm kiếm mục bạn quan tâm và nhấp vào mục đó để xem chi tiết. Sau đó bạn có thể tham gia đấu giá bằng cách nhập số tiền bạn muốn đặt.",
    displayOrder: 1,
    isActive: true,
    views: 1250,
    helpful: 980,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    question: "Chi phí giao dịch là bao nhiêu?",
    answer:
      "Chúng tôi tính phí 5% trên giá bán cuối cùng cho cả người mua và người bán.",
    displayOrder: 2,
    isActive: true,
    views: 890,
    helpful: 756,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockAdminBids: AdminBid[] = [
  {
    id: "1",
    auctionId: "1",
    auctionTitle: "Rolex Daytona 2024",
    bidderId: "user-1",
    bidderName: "Phạm Thị C",
    amount: 18500,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    auctionId: "2",
    auctionTitle: "Tesla Model S Plaid",
    bidderId: "user-2",
    bidderName: "Hoàng Văn D",
    amount: 72000,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions for mock data
export function getMockAuctionById(id: string): AdminAuction | undefined {
  return mockAdminAuctions.find((a) => a.id === id);
}

export function getMockCategoryById(id: string): AdminCategory | undefined {
  return mockAdminCategories.find((c) => c.id === id);
}

export function getMockBidById(id: string): AdminBid | undefined {
  return mockAdminBids.find((b) => b.id === id);
}
