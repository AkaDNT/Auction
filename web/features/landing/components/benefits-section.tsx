import { benefitItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function BenefitsSection() {
  return (
    <SectionShell
      id="benefits"
      eyebrow="Benefits"
      title="A marketplace experience that helps both sides move with confidence"
      description="This layout highlights trust, utility, and flexibility for the platform business model."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="theme-callout rounded-[2rem] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary">
            Why it wins
          </p>
          <h3 className="mt-4 text-3xl font-semibold theme-heading">
            Designed to strengthen trust at every decision point.
          </h3>
          <p className="mt-4 text-sm leading-7 theme-muted">
            The interface makes auction states, seller readiness, and buyer
            actions clear, so teams can move faster without losing operational
            control.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">
                Zero ambiguity
              </p>
              <p className="mt-2 text-sm leading-6 theme-muted">
                Every step is visible and easy to interpret.
              </p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">
                Enterprise fit
              </p>
              <p className="mt-2 text-sm leading-6 theme-muted">
                Built to support governance and scale.
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
