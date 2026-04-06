import Link from "next/link";

const footerLinks = [
  { label: "Trang chủ", href: "#home" },
  { label: "Tính năng", href: "#features" },
  { label: "Nhận xét", href: "#testimonials" },
  { label: "Bảng giá", href: "#pricing" },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-[color:var(--border)] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
            Sàn Đấu Giá
          </p>
          <p className="mt-2 text-sm theme-muted">
            Giao diện sàn đấu giá sẵn sàng cho doanh nghiệp, được thiết kế để
            tạo niềm tin và mở rộng quy mô.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm theme-muted transition hover:text-[color:var(--primary-strong)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
