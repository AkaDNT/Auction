const CATEGORY_LABELS: Record<string, string> = {
  electronics: "Điện tử & công nghệ",
  fashion: "Thời trang",
  collectibles: "Sưu tầm & hiếm",
  "home-living": "Nhà cửa & đời sống",
  sports: "Thể thao",
  beauty: "Làm đẹp",
  books: "Sách & truyện",
  toys: "Đồ chơi",
  automotive: "Ô tô & xe máy",
  art: "Nghệ thuật",
};

export function getVietnameseCategoryLabel(
  slug: string,
  fallbackLabel: string,
): string {
  return CATEGORY_LABELS[slug] ?? fallbackLabel;
}
