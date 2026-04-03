import { statItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function StatsSection() {
  return (
    <SectionShell
      id="stats"
      eyebrow="Stats"
      title="Operational numbers that communicate scale at a glance"
      description="These metrics position the marketplace as active, trusted, and commercially mature."
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
