import { PrismaClient } from "@prisma/client";

export async function seedAuctionCategories(prisma: PrismaClient) {
  const categories = [
    {
      slug: "electronics",
      label: "Điện tử",
      description:
        "Điện thoại, máy tính xách tay, máy tính bảng và thiết bị công nghệ",
    },
    {
      slug: "fashion",
      label: "Thời trang",
      description: "Quần áo, giày dép, túi xách và phụ kiện",
    },
    {
      slug: "collectibles",
      label: "Đồ sưu tầm",
      description: "Mô hình, thẻ bài, vật phẩm hiếm và đồ lưu niệm",
    },
    {
      slug: "home-living",
      label: "Nhà cửa & Đời sống",
      description: "Nội thất, dụng cụ nhà bếp và đồ gia dụng",
    },
    {
      slug: "sports",
      label: "Thể thao",
      description: "Dụng cụ thể thao và phụ kiện tập gym",
    },
    {
      slug: "beauty",
      label: "Làm đẹp",
      description: "Sản phẩm chăm sóc da và làm đẹp cá nhân",
    },
    {
      slug: "books",
      label: "Sách",
      description: "Sách, tiểu thuyết, truyện tranh và tạp chí",
    },
    {
      slug: "toys",
      label: "Đồ chơi",
      description: "Đồ chơi, trò chơi và các sản phẩm giải trí",
    },
    {
      slug: "automotive",
      label: "Ô tô & Xe máy",
      description: "Phụ kiện xe và dụng cụ bảo dưỡng",
    },
    {
      slug: "art",
      label: "Nghệ thuật",
      description: "Tác phẩm nghệ thuật, đồ thủ công và trang trí",
    },
  ];

  for (const category of categories) {
    await prisma.auctionCategory.upsert({
      where: { slug: category.slug },
      update: {
        label: category.label,
        description: category.description,
      },
      create: category,
    });
  }

  console.log(`✅ Đã cập nhật ${categories.length} danh mục đấu giá`);
}
