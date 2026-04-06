import type {
  AuctionCategory,
  AuctionFaq,
  AuctionFeature,
  AuctionSummary,
  LiveBidEvent,
} from "../types/auction";
import { getAuctionImage } from "@/shared/lib/mock-images";

function toTimeEnd(duration: string, isPast = false) {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  const deltaMs = ((hours * 60 + minutes) * 60 + seconds) * 1000;
  const target = isPast ? Date.now() - deltaMs : Date.now() + deltaMs;
  return new Date(target).toISOString();
}

export const auctionCategories: AuctionCategory[] = [
  { slug: "dong-ho-cao-cap", label: "Đồng hồ cao cấp", count: 18 },
  { slug: "xe-dien", label: "Xe điện", count: 9 },
  { slug: "nghe-thuat-suu-tam", label: "Nghệ thuật sưu tầm", count: 14 },
  { slug: "thiet-bi-cong-nghe", label: "Thiết bị công nghệ", count: 22 },
];

export const sortOptions = [
  "Mới nhất",
  "Sắp kết thúc",
  "Giá cao nhất",
  "Giá khởi điểm thấp nhất",
];

export const liveAuctions: AuctionSummary[] = [
  {
    id: "auc-1001",
    title: "Rolex Daytona Platinum 2024",
    category: "Đồng hồ cao cấp",
    currentBid: "1.050.000.000 VND",
    startingPrice: "750.000.000 VND",
    timeEnd: toTimeEnd("01:42:18"),
    bidCount: 26,
    status: "Đang diễn ra",
    seller: "LuxTime Holdings",
    imageUrl: getAuctionImage("auc-1001"),
  },
  {
    id: "auc-1002",
    title: "Tesla Model S Plaid Signature",
    category: "Xe điện",
    currentBid: "2.162.500.000 VND",
    startingPrice: "1.725.000.000 VND",
    timeEnd: toTimeEnd("05:11:04"),
    bidCount: 18,
    status: "Sắp hết",
    seller: "EV Prime Auto",
    imageUrl: getAuctionImage("auc-1002"),
  },
  {
    id: "auc-1003",
    title: "Bộ tranh đương đại phiên bản giới hạn",
    category: "Nghệ thuật sưu tầm",
    currentBid: "330.000.000 VND",
    startingPrice: "200.000.000 VND",
    timeEnd: toTimeEnd("00:58:31"),
    bidCount: 31,
    status: "Đang diễn ra",
    seller: "Monarch Art House",
    imageUrl: getAuctionImage("auc-1003"),
  },
  {
    id: "auc-1004",
    title: "Mac Pro M4 Ultra Studio Bundle",
    category: "Thiết bị công nghệ",
    currentBid: "261.250.000 VND",
    startingPrice: "180.000.000 VND",
    timeEnd: toTimeEnd("03:26:50"),
    bidCount: 14,
    status: "Sắp tới",
    seller: "TechGrid Partner",
    imageUrl: getAuctionImage("auc-1004"),
  },
  {
    id: "auc-1005",
    title: "Porsche Taycan Turbo S 2025",
    category: "Xe điện",
    currentBid: "2.807.500.000 VND",
    startingPrice: "2.250.000.000 VND",
    timeEnd: toTimeEnd("08:04:10"),
    bidCount: 9,
    status: "Sắp tới",
    seller: "Velocity Motors",
    imageUrl: getAuctionImage("auc-1005"),
  },
  {
    id: "auc-1006",
    title: "AP Royal Oak Chronograph Gold",
    category: "Đồng hồ cao cấp",
    currentBid: "1.445.000.000 VND",
    startingPrice: "1.350.000.000 VND",
    timeEnd: toTimeEnd("02:13:44", true),
    bidCount: 42,
    status: "Đã kết thúc",
    seller: "Prime Watch Gallery",
    imageUrl: getAuctionImage("auc-1006"),
  },
];

export const auctionFeatures: AuctionFeature[] = [
  {
    title: "Đấu giá thời gian thực ở quy mô lớn",
    description:
      "Hệ thống cập nhật giá theo thời gian thực giúp người mua và người bán theo dõi diễn biến phiên ngay lập tức.",
  },
  {
    title: "Giao dịch đã kiểm soát rủi ro",
    description:
      "Mọi bước xác thực, ký quỹ và đối soát thanh toán đều được chuẩn hóa cho vận hành doanh nghiệp.",
  },
  {
    title: "Nền tảng cho cả người mua và người bán",
    description:
      "Bảng điều khiển chuyên biệt giúp người bán quản lý lô hàng, người mua theo dõi giá và đặt lệnh nhanh.",
  },
];

export const auctionFaqs: AuctionFaq[] = [
  {
    question: "Làm thế nào để tham gia đấu giá?",
    answer:
      "Bạn cần đăng ký tài khoản, hoàn tất xác thực và nạp ký quỹ theo quy định của từng phiên đấu giá.",
  },
  {
    question: "Giá hiện tại được cập nhật theo cơ chế nào?",
    answer:
      "Giá hiện tại được đồng bộ theo thời gian thực từ phòng đấu giá trực tiếp và hiển thị ngay trên danh sách phiên.",
  },
  {
    question: "Tôi có thể vừa mua vừa bán trên cùng tài khoản không?",
    answer:
      "Có. Tài khoản doanh nghiệp có thể kích hoạt đồng thời vai trò người mua và người bán với phân quyền nội bộ.",
  },
  {
    question: "Nếu thắng đấu giá thì quy trình thanh toán ra sao?",
    answer:
      "Sau khi phiên đóng, hệ thống tạo lệnh thanh toán, xác minh chứng từ và hướng dẫn bàn giao theo SLA của nền tảng.",
  },
];

export const liveBidEvents: LiveBidEvent[] = [
  { bidder: "Hưng N.", amount: "1.052.500.000 VND", time: "12:04:11" },
  { bidder: "An T.", amount: "1.057.500.000 VND", time: "12:04:42" },
  { bidder: "GlobalTrade LLC", amount: "1.062.500.000 VND", time: "12:05:08" },
  { bidder: "Minh P.", amount: "1.067.500.000 VND", time: "12:05:33" },
];

export function getAuctionById(id: string) {
  return liveAuctions.find((auction) => auction.id === id);
}

export function getAuctionsByCategory(slug: string) {
  const category = auctionCategories.find((item) => item.slug === slug);

  if (!category) {
    return [];
  }

  return liveAuctions.filter((auction) => auction.category === category.label);
}

export function getCategoryLabel(slug: string) {
  return (
    auctionCategories.find((item) => item.slug === slug)?.label ?? "Danh mục"
  );
}
