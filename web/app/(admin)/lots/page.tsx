import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

const lots = [
  { title: "Đồng hồ cao cấp", count: "18 lô", status: "Nhu cầu cao" },
  { title: "Xe điện", count: "9 lô", status: "Đang xử lý" },
  { title: "Hàng sưu tầm", count: "14 lô", status: "Đã lên lịch" },
];

export default function LotsPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Lô hàng
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Tổng quan quản lý danh mục
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Sắp xếp danh sách đăng tải, kiểm tra trạng thái phê duyệt và luân
          chuyển hàng hóa qua toàn bộ quy trình đấu giá.
        </p>
        <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-52">
          <Image
            src={mockImages.lotsBoard}
            alt="Bảng vận hành lô hàng"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {lots.map((lot) => (
          <article key={lot.title} className="theme-card rounded-[1.5rem] p-6">
            <p className="text-xl font-semibold theme-heading">{lot.title}</p>
            <p className="mt-3 text-sm theme-muted">{lot.count}</p>
            <p className="mt-5 theme-primary">{lot.status}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
