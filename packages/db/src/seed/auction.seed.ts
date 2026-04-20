import { AuctionStatus, Prisma, PrismaClient, Role } from "@prisma/client";

type SellerLite = {
  id: string;
  name: string;
  email: string;
};

type CategoryLite = {
  id: string;
  slug: string;
  label: string;
};

type ProductSeedTemplate = {
  title: string;
  slug: string;
  description: string;
  startingPrice: number;
  reservePrice?: number | null;
  buyNowPrice?: number | null;
  minBidIncrement?: number;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function toDecimal(value: number | null | undefined) {
  if (value === null || value === undefined) return null;
  return new Prisma.Decimal(value);
}

function getAuctionStatus(index: number): AuctionStatus {
  const statuses: AuctionStatus[] = [
    AuctionStatus.DRAFT,
    AuctionStatus.UPCOMING,
    AuctionStatus.LIVE,
    AuctionStatus.ENDED,
    AuctionStatus.CANCELLED,
  ];

  return statuses[index % statuses.length];
}

function getAuctionSchedule(status: AuctionStatus, index: number) {
  const now = new Date();

  switch (status) {
    case AuctionStatus.DRAFT:
      return {
        startAt: null,
        endAt: addDays(now, 10 + (index % 10)),
      };

    case AuctionStatus.UPCOMING: {
      const startAt = addHours(addDays(now, 1 + (index % 7)), index % 12);
      const endAt = addDays(startAt, 3 + (index % 4));
      return { startAt, endAt };
    }

    case AuctionStatus.LIVE: {
      const startAt = addDays(now, -1 - (index % 3));
      const endAt = addDays(now, 1 + (index % 4));
      return { startAt, endAt };
    }

    case AuctionStatus.ENDED: {
      const startAt = addDays(now, -7 - (index % 5));
      const endAt = addDays(now, -1 - (index % 2));
      return { startAt, endAt };
    }

    case AuctionStatus.CANCELLED: {
      const startAt = addDays(now, -2 - (index % 2));
      const endAt = addDays(now, 2 + (index % 3));
      return { startAt, endAt };
    }

    default:
      return {
        startAt: null,
        endAt: addDays(now, 30),
      };
  }
}

function buildCurrentPrice(
  status: AuctionStatus,
  startingPrice: number,
  reservePrice?: number | null,
) {
  if (
    status !== AuctionStatus.LIVE &&
    status !== AuctionStatus.ENDED &&
    status !== AuctionStatus.CANCELLED
  ) {
    return null;
  }

  const floor = startingPrice * 1.03;
  const target =
    reservePrice && reservePrice > startingPrice
      ? Math.min(reservePrice * 0.98, startingPrice * 1.25)
      : startingPrice * 1.12;

  return Math.round(Math.max(floor, target));
}

function buildAuctionCode(index: number) {
  return `AUC-${String(index).padStart(4, "0")}`;
}

/**
 * LoremFlickr hỗ trợ ảnh theo keyword và lock query param.
 * Picsum hỗ trợ seed cố định theo URL.
 */
const CATEGORY_IMAGE_KEYWORDS: Record<string, string[]> = {
  electronics: ["electronics", "gadget", "laptop"],
  fashion: ["fashion", "clothes", "shoes"],
  collectibles: ["collectible", "toy", "figure"],
  "home-living": ["interior", "furniture", "kitchen"],
  sports: ["sports", "fitness", "bicycle"],
  beauty: ["beauty", "cosmetics", "perfume"],
  books: ["books", "library", "reading"],
  toys: ["toys", "lego", "game"],
  automotive: ["car", "automotive", "engine"],
  art: ["art", "painting", "sculpture"],
};

function buildLoremFlickrUrl(keyword: string, lock: number) {
  return `https://loremflickr.com/1200/900/${encodeURIComponent(keyword)}?lock=${lock}`;
}

function buildPicsumFallback(seed: string) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
}

function getThumbnailForCategory(categorySlug: string, index: number) {
  const keywords = CATEGORY_IMAGE_KEYWORDS[categorySlug];

  if (!keywords?.length) {
    return buildPicsumFallback(`${categorySlug}-${index}`);
  }

  const keyword = keywords[index % keywords.length];

  // lock giúp cùng URL thường trả cùng ảnh trong thời gian cache còn hiệu lực
  return buildLoremFlickrUrl(keyword, 1000 + index);
}

const AUCTION_TEMPLATES_BY_CATEGORY: Record<string, ProductSeedTemplate[]> = {
  electronics: [
    {
      title: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max-256gb",
      description:
        "Flagship smartphone, phù hợp công việc, quay chụp và sử dụng hằng ngày.",
      startingPrice: 24500000,
      reservePrice: 26800000,
      buyNowPrice: 28900000,
      minBidIncrement: 200000,
    },
    {
      title: "MacBook Air M2 8GB 256GB",
      slug: "macbook-air-m2-8gb-256gb",
      description:
        "Laptop mỏng nhẹ, pin lâu, phù hợp học tập và làm việc văn phòng.",
      startingPrice: 15900000,
      reservePrice: 16900000,
      buyNowPrice: 17990000,
      minBidIncrement: 200000,
    },
    {
      title: "iPad Air M2 11 inch Wi-Fi",
      slug: "ipad-air-m2-11-inch-wifi",
      description:
        "Máy tính bảng hiệu năng cao, phù hợp học tập và làm việc di động.",
      startingPrice: 14900000,
      reservePrice: 15900000,
      buyNowPrice: 17200000,
      minBidIncrement: 150000,
    },
    {
      title: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Tai nghe chống ồn cao cấp, phù hợp làm việc và giải trí.",
      startingPrice: 6200000,
      reservePrice: 6900000,
      buyNowPrice: 7600000,
      minBidIncrement: 50000,
    },
  ],

  fashion: [
    {
      title: "Túi xách da nữ cao cấp",
      slug: "tui-xach-da-nu-cao-cap",
      description: "Thiết kế thanh lịch, phù hợp đi làm và dự tiệc.",
      startingPrice: 1800000,
      reservePrice: 2100000,
      buyNowPrice: 2500000,
      minBidIncrement: 50000,
    },
    {
      title: "Giày sneaker unisex giới hạn",
      slug: "giay-sneaker-unisex-gioi-han",
      description: "Mẫu giày phong cách trẻ trung, dễ phối đồ.",
      startingPrice: 2200000,
      reservePrice: 2500000,
      buyNowPrice: 2900000,
      minBidIncrement: 50000,
    },
    {
      title: "Đồng hồ thời trang nam dây thép",
      slug: "dong-ho-thoi-trang-nam-day-thep",
      description: "Thiết kế hiện đại, phù hợp phong cách công sở.",
      startingPrice: 3200000,
      reservePrice: 3600000,
      buyNowPrice: 4100000,
      minBidIncrement: 50000,
    },
  ],

  collectibles: [
    {
      title: "Mô hình figure anime phiên bản giới hạn",
      slug: "figure-anime-phien-ban-gioi-han",
      description: "Sản phẩm sưu tầm dành cho người yêu thích anime.",
      startingPrice: 2500000,
      reservePrice: 2900000,
      buyNowPrice: 3400000,
      minBidIncrement: 50000,
    },
    {
      title: "Thẻ bài TCG hiếm",
      slug: "the-bai-tcg-hiem",
      description: "Thẻ bài hiếm, tình trạng đẹp, phù hợp sưu tầm.",
      startingPrice: 1200000,
      reservePrice: 1450000,
      buyNowPrice: 1700000,
      minBidIncrement: 50000,
    },
    {
      title: "Zippo cổ sưu tầm",
      slug: "zippo-co-suu-tam",
      description: "Bật lửa cổ dành cho người chơi đồ sưu tầm.",
      startingPrice: 2800000,
      reservePrice: 3200000,
      buyNowPrice: 3700000,
      minBidIncrement: 50000,
    },
  ],

  "home-living": [
    {
      title: "Bộ nồi inox 5 món",
      slug: "bo-noi-inox-5-mon",
      description: "Phù hợp nhu cầu bếp gia đình hiện đại.",
      startingPrice: 1400000,
      reservePrice: 1650000,
      buyNowPrice: 1900000,
      minBidIncrement: 50000,
    },
    {
      title: "Ghế công thái học văn phòng",
      slug: "ghe-cong-thai-hoc-van-phong",
      description: "Hỗ trợ ngồi làm việc lâu, phù hợp setup góc làm việc.",
      startingPrice: 3200000,
      reservePrice: 3600000,
      buyNowPrice: 4200000,
      minBidIncrement: 50000,
    },
    {
      title: "Máy hút bụi cầm tay gia đình",
      slug: "may-hut-bui-cam-tay-gia-dinh",
      description: "Thiết bị gia dụng tiện lợi cho không gian sống.",
      startingPrice: 2100000,
      reservePrice: 2400000,
      buyNowPrice: 2800000,
      minBidIncrement: 50000,
    },
  ],

  sports: [
    {
      title: "Vợt cầu lông cao cấp",
      slug: "vot-cau-long-cao-cap",
      description: "Phù hợp người chơi phong trào và bán chuyên.",
      startingPrice: 1700000,
      reservePrice: 1950000,
      buyNowPrice: 2250000,
      minBidIncrement: 50000,
    },
    {
      title: "Máy tập cơ bụng tại nhà",
      slug: "may-tap-co-bung-tai-nha",
      description: "Thiết bị hỗ trợ rèn luyện thể lực tại nhà.",
      startingPrice: 2600000,
      reservePrice: 2950000,
      buyNowPrice: 3400000,
      minBidIncrement: 50000,
    },
    {
      title: "Xe đạp thể thao khung nhôm",
      slug: "xe-dap-the-thao-khung-nhom",
      description: "Mẫu xe đạp phù hợp luyện tập hằng ngày.",
      startingPrice: 5200000,
      reservePrice: 5800000,
      buyNowPrice: 6500000,
      minBidIncrement: 100000,
    },
  ],

  beauty: [
    {
      title: "Bộ dưỡng da cao cấp",
      slug: "bo-duong-da-cao-cap",
      description: "Combo chăm sóc da dành cho nhu cầu hằng ngày.",
      startingPrice: 1300000,
      reservePrice: 1500000,
      buyNowPrice: 1750000,
      minBidIncrement: 50000,
    },
    {
      title: "Máy rửa mặt ion",
      slug: "may-rua-mat-ion",
      description: "Thiết bị chăm sóc cá nhân phổ biến.",
      startingPrice: 900000,
      reservePrice: 1100000,
      buyNowPrice: 1300000,
      minBidIncrement: 50000,
    },
    {
      title: "Nước hoa unisex 100ml",
      slug: "nuoc-hoa-unisex-100ml",
      description: "Mùi hương thanh lịch, phù hợp sử dụng hằng ngày.",
      startingPrice: 2100000,
      reservePrice: 2450000,
      buyNowPrice: 2850000,
      minBidIncrement: 50000,
    },
  ],

  books: [
    {
      title: "Bộ sách kinh doanh chọn lọc",
      slug: "bo-sach-kinh-doanh-chon-loc",
      description: "Tập hợp các đầu sách phù hợp người làm kinh doanh.",
      startingPrice: 650000,
      reservePrice: 800000,
      buyNowPrice: 950000,
      minBidIncrement: 20000,
    },
    {
      title: "Truyện tranh bản đặc biệt",
      slug: "truyen-tranh-ban-dac-biet",
      description: "Phiên bản in đẹp, phù hợp người sưu tầm.",
      startingPrice: 480000,
      reservePrice: 600000,
      buyNowPrice: 720000,
      minBidIncrement: 20000,
    },
    {
      title: "Bộ tiểu thuyết kinh điển",
      slug: "bo-tieu-thuyet-kinh-dien",
      description: "Bộ sách dành cho người yêu văn học.",
      startingPrice: 720000,
      reservePrice: 860000,
      buyNowPrice: 990000,
      minBidIncrement: 20000,
    },
  ],

  toys: [
    {
      title: "Lego mô hình thành phố",
      slug: "lego-mo-hinh-thanh-pho",
      description: "Đồ chơi lắp ráp phù hợp trẻ em và người sưu tầm.",
      startingPrice: 1800000,
      reservePrice: 2100000,
      buyNowPrice: 2450000,
      minBidIncrement: 50000,
    },
    {
      title: "Robot điều khiển từ xa",
      slug: "robot-dieu-khien-tu-xa",
      description: "Đồ chơi điện tử giải trí cho trẻ em.",
      startingPrice: 950000,
      reservePrice: 1150000,
      buyNowPrice: 1350000,
      minBidIncrement: 50000,
    },
    {
      title: "Búp bê sưu tầm phiên bản đặc biệt",
      slug: "bup-be-suu-tam-phien-ban-dac-biet",
      description: "Phù hợp trưng bày và sưu tầm.",
      startingPrice: 1250000,
      reservePrice: 1500000,
      buyNowPrice: 1750000,
      minBidIncrement: 50000,
    },
  ],

  automotive: [
    {
      title: "Camera hành trình ô tô",
      slug: "camera-hanh-trinh-o-to",
      description: "Phụ kiện hữu ích cho phương tiện cá nhân.",
      startingPrice: 1900000,
      reservePrice: 2200000,
      buyNowPrice: 2550000,
      minBidIncrement: 50000,
    },
    {
      title: "Máy bơm lốp mini",
      slug: "may-bom-lop-mini",
      description: "Thiết bị tiện lợi cho xe máy và ô tô.",
      startingPrice: 780000,
      reservePrice: 920000,
      buyNowPrice: 1080000,
      minBidIncrement: 20000,
    },
    {
      title: "Bộ vệ sinh nội thất xe",
      slug: "bo-ve-sinh-noi-that-xe",
      description: "Phù hợp chăm sóc xe cá nhân định kỳ.",
      startingPrice: 520000,
      reservePrice: 650000,
      buyNowPrice: 780000,
      minBidIncrement: 20000,
    },
  ],

  art: [
    {
      title: "Tranh canvas trang trí phòng khách",
      slug: "tranh-canvas-trang-tri-phong-khach",
      description: "Tác phẩm decor hiện đại cho không gian sống.",
      startingPrice: 1600000,
      reservePrice: 1900000,
      buyNowPrice: 2250000,
      minBidIncrement: 50000,
    },
    {
      title: "Tượng decor thủ công",
      slug: "tuong-decor-thu-cong",
      description: "Sản phẩm trang trí mang tính nghệ thuật.",
      startingPrice: 2100000,
      reservePrice: 2450000,
      buyNowPrice: 2850000,
      minBidIncrement: 50000,
    },
    {
      title: "Bình gốm nghệ thuật",
      slug: "binh-gom-nghe-thuat",
      description: "Sản phẩm thủ công dùng trang trí hoặc trưng bày.",
      startingPrice: 1400000,
      reservePrice: 1680000,
      buyNowPrice: 1980000,
      minBidIncrement: 50000,
    },
  ],
};

function getTemplatesForCategory(
  category: CategoryLite,
): ProductSeedTemplate[] {
  const templates = AUCTION_TEMPLATES_BY_CATEGORY[category.slug];
  if (!templates?.length) {
    throw new Error(`Missing auction templates for category: ${category.slug}`);
  }
  return templates;
}

function buildAuctionData(
  template: ProductSeedTemplate,
  category: CategoryLite,
  seller: SellerLite,
  status: AuctionStatus,
  index: number,
) {
  const { startAt, endAt } = getAuctionSchedule(status, index);

  const startingPrice = template.startingPrice + (index % 3) * 100000;
  const reservePrice =
    template.reservePrice === null || template.reservePrice === undefined
      ? null
      : template.reservePrice + (index % 2) * 100000;

  const buyNowPrice =
    template.buyNowPrice === null || template.buyNowPrice === undefined
      ? null
      : template.buyNowPrice + (index % 2) * 100000;

  const currentPrice = buildCurrentPrice(status, startingPrice, reservePrice);
  const code = buildAuctionCode(index);

  const title =
    status === AuctionStatus.LIVE
      ? `${template.title} - Live Auction`
      : status === AuctionStatus.ENDED
        ? `${template.title} - Closed`
        : template.title;

  const slug = `${template.slug}-${code.toLowerCase()}`;
  const thumbnailUrl = getThumbnailForCategory(category.slug, index);

  return {
    code,
    slug,
    title,
    description:
      `${template.description} ` +
      `Category: ${category.label}. ` +
      `Seller: ${seller.name}. ` +
      `Auction code: ${code}.`,
    startingPrice: toDecimal(startingPrice)!,
    reservePrice: toDecimal(reservePrice),
    currentPrice: toDecimal(currentPrice),
    buyNowPrice: toDecimal(buyNowPrice),
    minBidIncrement: toDecimal(template.minBidIncrement ?? 50000)!,
    startAt,
    endAt,
    status,
    sellerId: seller.id,
    categoryId: category.id,
    thumbnailUrl,
  };
}

export async function seedAuctions(prisma: PrismaClient) {
  const sellers = await prisma.user.findMany({
    where: {
      userRoles: {
        some: {
          role: Role.SELLER,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  const categories = await prisma.auctionCategory.findMany({
    select: {
      id: true,
      slug: true,
      label: true,
    },
    orderBy: {
      slug: "asc",
    },
  });

  if (!sellers.length) {
    throw new Error("No SELLER users found. Please seed users first.");
  }

  if (!categories.length) {
    throw new Error(
      "No auction categories found. Please seed categories first.",
    );
  }

  const targetCount = 100;
  let seeded = 0;

  for (let i = 0; seeded < targetCount; i++) {
    const seller = sellers[i % sellers.length];
    const category = categories[i % categories.length];
    const templates = getTemplatesForCategory(category);
    const template =
      templates[Math.floor(i / categories.length) % templates.length];
    const status = getAuctionStatus(i + 1);

    const auctionData = buildAuctionData(
      template,
      category,
      seller,
      status,
      seeded + 1,
    );

    await prisma.auction.upsert({
      where: { code: auctionData.code },
      update: {
        title: auctionData.title,
        slug: auctionData.slug,
        description: auctionData.description,
        startingPrice: auctionData.startingPrice,
        reservePrice: auctionData.reservePrice,
        currentPrice: auctionData.currentPrice,
        buyNowPrice: auctionData.buyNowPrice,
        minBidIncrement: auctionData.minBidIncrement,
        startAt: auctionData.startAt,
        endAt: auctionData.endAt,
        status: auctionData.status,
        sellerId: auctionData.sellerId,
        categoryId: auctionData.categoryId,
        thumbnailUrl: auctionData.thumbnailUrl,
      },
      create: {
        code: auctionData.code,
        title: auctionData.title,
        slug: auctionData.slug,
        description: auctionData.description,
        startingPrice: auctionData.startingPrice,
        reservePrice: auctionData.reservePrice,
        currentPrice: auctionData.currentPrice,
        buyNowPrice: auctionData.buyNowPrice,
        minBidIncrement: auctionData.minBidIncrement,
        startAt: auctionData.startAt,
        endAt: auctionData.endAt,
        status: auctionData.status,
        sellerId: auctionData.sellerId,
        categoryId: auctionData.categoryId,
        thumbnailUrl: auctionData.thumbnailUrl,
      },
    });

    seeded++;
  }

  console.log(`✅ Seeded ${seeded} auctions with remote thumbnails`);
}
