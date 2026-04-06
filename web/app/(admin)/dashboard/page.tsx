import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

const overviewCards = [
  { label: "Phiên đang mở", value: "42", note: "6 phiên chốt hôm nay" },
  {
    label: "Người bán đang hoạt động",
    value: "186",
    note: "14 hồ sơ chờ duyệt",
  },
  {
    label: "Tổng giá trị đặt giá",
    value: "$18.4M",
    note: "+12% so với tuần trước",
  },
  {
    label: "Tỷ lệ chuyển đổi",
    value: "68%",
    note: "Đà tăng trưởng thị trường tích cực",
  },
];

const recentLots = [
  {
    name: "Rolex Daytona 2024",
    status: "Đang đặt giá",
    bids: "24 lượt đặt giá",
    amount: "$42,000",
  },
  {
    name: "Tesla Model S Plaid",
    status: "Đang rà soát",
    bids: "18 lượt đặt giá",
    amount: "$86,500",
  },
  {
    name: "Bộ sưu tập nghệ thuật",
    status: "Đã lên lịch",
    bids: "9 lượt đặt giá",
    amount: "$13,200",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <article key={card.label} className="theme-card rounded-[1.5rem] p-6">
            <p className="text-sm uppercase tracking-[0.35em] theme-primary">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-semibold theme-heading">
              {card.value}
            </p>
            <p className="mt-3 text-sm theme-muted">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="theme-callout rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Nhịp thị trường
          </p>
          <h2 className="mt-4 text-2xl font-semibold theme-heading">
            Trọng tâm vận hành hôm nay
          </h2>
          <p className="mt-3 text-sm leading-7 theme-muted">
            Theo dõi mức sẵn sàng của lô hàng, xác nhận phê duyệt người bán và
            đẩy các phiên giá trị cao vào khung chốt cuối cùng.
          </p>
          <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-52">
            <Image
              src={mockImages.homeMarket}
              alt="Nhịp thị trường trong ngày"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">12</p>
              <p className="mt-2 text-sm theme-muted">Lô chờ rà soát</p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">8</p>
              <p className="mt-2 text-sm theme-muted">
                Thanh toán chờ ghi nhận
              </p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">4</p>
              <p className="mt-2 text-sm theme-muted">Sự cố cần xử lý</p>
            </div>
          </div>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] theme-primary">
                Lô gần đây
              </p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">
                Danh mục ưu tiên cao
              </h2>
            </div>
            <span className="theme-eyebrow">Luồng trực tiếp</span>
          </div>
          <div className="mt-6 space-y-4">
            {recentLots.map((lot) => (
              <div
                key={lot.name}
                className="rounded-2xl border border-[color:var(--border)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold theme-heading">{lot.name}</p>
                    <p className="mt-1 text-sm theme-muted">{lot.bids}</p>
                  </div>
                  <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                    {lot.status}
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold theme-primary">
                  {lot.amount}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
