import type {
  BenefitItem,
  FeatureItem,
  HeroMetric,
  LogoItem,
  NavLink,
  PricingPlan,
  StatItem,
  StepItem,
  TeamMember,
  TestimonialItem,
} from "../types/home";

export const navLinks: NavLink[] = [
  { label: "Trang chủ", href: "#home" },
  { label: "Đấu giá", href: "/auctions" },
  { label: "Tính năng", href: "#features" },
  { label: "Quy trình", href: "#how-it-works" },
  { label: "Gói dịch vụ", href: "#pricing" },
  { label: "Liên hệ", href: "#footer" },
];

export const heroMetrics: HeroMetric[] = [
  {
    value: "2.4K",
    label: "Phiên đang mở",
    description:
      "Danh mục hàng hóa giá trị cao và luân chuyển nhanh đang được đấu giá theo thời gian thực.",
  },
  {
    value: "97%",
    label: "Tỷ lệ chốt thành công",
    description:
      "Luồng đấu giá được tối ưu để duy trì tính cạnh tranh và nâng xác suất chốt phiên.",
  },
  {
    value: "24/7",
    label: "Phủ sóng 24/7",
    description:
      "Nền tảng vận hành liên tục, đáp ứng nhu cầu mua bán và kiểm soát tin cậy mọi thời điểm.",
  },
];

export const featureItems: FeatureItem[] = [
  {
    title: "Cơ chế đặt giá thời gian thực",
    description:
      "Đồng bộ thay đổi tức thời để người mua, người bán và đội vận hành luôn theo sát từng nhịp đấu giá.",
    badge: "Trực tiếp",
  },
  {
    title: "Luồng giao dịch đã xác thực",
    description:
      "Các bước đặt cọc, phê duyệt và thanh toán được chuẩn hóa nhằm giảm thiểu rủi ro toàn hệ thống.",
    badge: "An toàn",
  },
  {
    title: "Điều phối danh mục hàng hóa",
    description:
      "Quản lý nhiều nhóm hàng, lô đấu giá cao cấp và lịch mở bán từ một lớp điều hành thống nhất.",
    badge: "Mở rộng",
  },
  {
    title: "Công cụ tối ưu cho người bán",
    description:
      "Bảng điều khiển vận hành giúp đội ngũ đăng lô, theo dõi giá và kết thúc phiên nhanh hơn.",
    badge: "Vận hành",
  },
];

export const benefitItems: BenefitItem[] = [
  {
    title: "Niềm tin được tích hợp ở từng bước",
    description:
      "Xác thực rõ ràng, lịch sử đặt giá minh bạch và trạng thái lô hàng công khai giúp sàn tạo cảm giác an toàn.",
  },
  {
    title: "Thiết kế cho tốc độ",
    description:
      "Trải nghiệm được tinh gọn để người mua đặt giá nhanh, người bán xoay vòng hàng hiệu quả.",
  },
  {
    title: "Linh hoạt cho nhiều mô hình kinh doanh",
    description:
      "Hỗ trợ phí nền tảng, hoa hồng giao dịch, gói thành viên cao cấp và chương trình đối tác.",
  },
];

export const stepItems: StepItem[] = [
  {
    step: "01",
    title: "Đăng ký và xác thực",
    description:
      "Người dùng tạo tài khoản và hoàn tất xác thực để tham gia hệ sinh thái một cách an toàn.",
  },
  {
    step: "02",
    title: "Khám phá lô đấu giá đang mở",
    description:
      "Xem các phiên nổi bật, theo dõi giá hiện tại và đánh dấu những cơ hội đáng quan tâm.",
  },
  {
    step: "03",
    title: "Đặt giá hoặc đăng lô hàng",
    description:
      "Người mua đặt giá, người bán đăng lô kèm giá khởi điểm, thời gian và quy tắc giao dịch.",
  },
  {
    step: "04",
    title: "Kết thúc và thanh toán",
    description:
      "Các bước hoàn tất tự động dẫn dắt hai bên qua thanh toán, bàn giao và báo cáo.",
  },
];

export const statItems: StatItem[] = [
  {
    value: "$18.4M",
    label: "Tổng giá trị đặt giá",
    description:
      "Động lực giao dịch mạnh ở các nhóm hàng giá trị cao và tệp khách hàng quay lại.",
  },
  {
    value: "12 min",
    label: "Chu kỳ chuyển đổi trung bình",
    description:
      "Phễu chuyển đổi được rút ngắn từ quan tâm ban đầu đến xác nhận sở hữu lô.",
  },
  {
    value: "180+",
    label: "Đối tác bán hàng tin cậy",
    description:
      "Mạng lưới đối tác được sàng lọc gồm hàng hóa, logistics và dịch vụ hỗ trợ.",
  },
  {
    value: "4.9/5",
    label: "Mức hài lòng người mua",
    description:
      "Mức tin cậy được phản ánh qua trải nghiệm thị trường sạch, rõ ràng và ổn định.",
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Ava Nguyen",
    role: "Giám đốc sàn đấu giá",
    bio: "Phụ trách thu hút người bán, quản trị phiên đấu giá và mô hình vận hành cho các lô cao cấp.",
    initials: "AN",
  },
  {
    name: "Daniel Park",
    role: "Chiến lược sản phẩm",
    bio: "Định hình hành trình người mua, logic giá và các hệ thống giúp nền tảng duy trì độ tin cậy.",
    initials: "DP",
  },
  {
    name: "Sophia Reed",
    role: "Trưởng bộ phận vận hành",
    bio: "Điều phối xử lý, luồng tuân thủ và phối hợp đa phòng ban cho từng lô hàng.",
    initials: "SR",
  },
];

export const logoItems: LogoItem[] = [
  { name: "Atlas Supply", accent: "A" },
  { name: "Northstone", accent: "N" },
  { name: "Monarch Partners", accent: "M" },
  { name: "Summit Trade", accent: "S" },
];

export const testimonialItems: TestimonialItem[] = [
  {
    name: "Linh Tran",
    role: "Khách mua chủ lực",
    quote:
      "Luồng đặt giá rất nhanh và cao cấp. Chúng tôi có thể đánh giá lô hàng, ra quyết định nhanh mà vẫn giữ được độ tin cậy.",
  },
  {
    name: "Mark Ellis",
    role: "Người bán doanh nghiệp",
    quote:
      "Nền tảng cung cấp cho đội ngũ chúng tôi một cách làm bài bản để đăng hàng, xử lý phê duyệt và chốt phiên rõ ràng.",
  },
  {
    name: "Priya Shah",
    role: "Vận hành sàn",
    quote:
      "Mọi thứ đều được thiết kế để mở rộng quy mô. Giao diện truyền tải sự tin cậy mà không làm mất tốc độ hay độ chi tiết.",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Khởi đầu",
    price: "Miễn phí",
    description:
      "Dành cho người bán và người mua mới đang kiểm chứng quy trình.",
    features: [
      "Đăng lô cơ bản",
      "Quyền tham gia đặt giá tiêu chuẩn",
      "Hỗ trợ qua email",
    ],
  },
  {
    name: "Tăng trưởng",
    price: "$49/mo",
    description:
      "Dành cho đội ngũ vận hành thường xuyên cần kiểm soát chặt hơn và quan sát tốt hơn.",
    features: [
      "Công cụ tính hoa hồng",
      "Bảng điều khiển người bán",
      "Hỗ trợ ưu tiên",
    ],
    featured: true,
  },
  {
    name: "Doanh nghiệp",
    price: "Tùy chỉnh",
    description:
      "Dành cho quy mô lớn cần quản trị chặt chẽ và tích hợp hệ thống.",
    features: ["Onboarding riêng", "Phân quyền nâng cao", "Hỗ trợ theo SLA"],
  },
];
