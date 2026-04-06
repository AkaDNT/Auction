import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

const metrics = [
  { label: "Thời gian theo dõi TB", value: "14m 32s" },
  { label: "Độ sâu đặt giá", value: "7.8x" },
  { label: "Khách mua quay lại", value: "61%" },
  { label: "Tốc độ tất toán", value: "1.2 ngày" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="theme-card rounded-[1.5rem] p-6"
          >
            <p className="text-sm uppercase tracking-[0.35em] theme-primary">
              {metric.label}
            </p>
            <p className="mt-4 text-3xl font-semibold theme-heading">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="theme-callout rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Biểu đồ xu hướng
          </p>
          <h2 className="mt-4 text-2xl font-semibold theme-heading">
            Hiệu suất trong 30 ngày gần nhất
          </h2>
          <div className="relative mt-5 h-40 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-48">
            <Image
              src={mockImages.analyticsChart}
              alt="Biểu đồ phân tích hoạt động"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
          <div className="mt-6 flex min-h-64 items-end gap-3 rounded-[1.5rem] border border-[color:var(--border)] p-4">
            {[42, 58, 50, 74, 66, 82, 91].map((height, index) => (
              <div key={index} className="flex-1">
                <div
                  className="rounded-t-2xl bg-[color:var(--primary-strong)]"
                  style={{ height: `${height}%`, minHeight: "5rem" }}
                />
              </div>
            ))}
          </div>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Tóm tắt insight
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-7 theme-muted">
            <li>
              • Các nhóm hàng cao cấp tiếp tục vượt xa danh mục tiêu chuẩn về
              hiệu suất.
            </li>
            <li>
              • Các khung chốt dưới 24 giờ đang tạo ra tỷ lệ chuyển đổi mạnh
              nhất.
            </li>
            <li>
              • Thời gian onboarding người bán vẫn là nút thắt vận hành cần ưu
              tiên cải thiện.
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
