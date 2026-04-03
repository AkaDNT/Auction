import { featureItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function FeaturesSection() {
  return (
    <SectionShell
      id="features"
      eyebrow="Features"
      title="Core capabilities tuned for live auction operations"
      description="The platform focuses on three things that matter in enterprise marketplaces: speed, control, and confidence."
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
              <span className="text-xs uppercase tracking-[0.35em] theme-muted">
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
