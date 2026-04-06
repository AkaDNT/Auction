import { benefitItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function BenefitsSection() {
  return (
    <SectionShell
      id="benefits"
      eyebrow="Lợi ích"
      title="Trải nghiệm sàn giao dịch giúp cả hai phía vận hành với sự tự tin"
      description="Bố cục này nhấn mạnh niềm tin, tính hữu dụng và khả năng mở rộng cho mô hình kinh doanh của nền tảng."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="theme-callout rounded-[2rem] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary">
            Vì sao phù hợp
          </p>
          <h3 className="mt-4 text-3xl font-semibold theme-heading">
            Được thiết kế để củng cố niềm tin tại mọi điểm ra quyết định.
          </h3>
          <p className="mt-4 text-sm leading-7 theme-muted">
            Giao diện làm rõ trạng thái phiên đấu giá, mức sẵn sàng của người
            bán và hành động của người mua, giúp đội ngũ ra quyết định nhanh hơn
            mà vẫn giữ kiểm soát vận hành.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">
                Không mơ hồ
              </p>
              <p className="mt-2 text-sm leading-6 theme-muted">
                Mọi bước đều hiển thị rõ ràng, dễ hiểu và dễ kiểm tra.
              </p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">
                Phù hợp doanh nghiệp
              </p>
              <p className="mt-2 text-sm leading-6 theme-muted">
                Được xây dựng để hỗ trợ quản trị và mở rộng quy mô.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {benefitItems.map((item, index) => (
            <article
              key={item.title}
              className="theme-card rounded-[1.75rem] p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color:var(--primary-soft)] text-lg font-semibold theme-primary">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold theme-heading">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 theme-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
