import { featureItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function FeaturesSection() {
  return (
    <SectionShell
      id="features"
      eyebrow="Tính năng"
      title="Các năng lực cốt lõi dành cho vận hành phiên đấu giá trực tiếp"
      description="Nền tảng tập trung vào ba yếu tố quan trọng nhất của một sàn doanh nghiệp: tốc độ, kiểm soát và độ tin cậy."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {featureItems.map((item) => (
          <article
            key={item.title}
            className="theme-card group rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-[color:var(--primary)]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                {item.badge}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-semibold theme-heading">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
