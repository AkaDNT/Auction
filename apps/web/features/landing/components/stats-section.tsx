import { statItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function StatsSection() {
  return (
    <SectionShell
      id="stats"
      eyebrow="Số liệu"
      title="Những chỉ số vận hành cho thấy quy mô chỉ trong một cái nhìn"
      description="Các con số này thể hiện sàn đang hoạt động mạnh, có độ tin cậy cao và đã đạt độ chín thương mại."
      align="center"
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((stat) => (
          <article
            key={stat.label}
            className="theme-callout rounded-[1.75rem] p-6 text-left"
          >
            <p className="text-4xl font-semibold tracking-tight theme-heading">
              {stat.value}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.32em] theme-primary">
              {stat.label}
            </p>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {stat.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
