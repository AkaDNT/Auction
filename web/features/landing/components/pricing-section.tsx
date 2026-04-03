import { pricingPlans } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function PricingSection() {
  return (
    <SectionShell
      id="pricing"
      eyebrow="Pricing"
      title="Flexible pricing that supports platform fees, commissions, and memberships"
      description="The pricing block stays intentionally simple while signaling an enterprise-grade commercial model."
      align="center"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-[1.75rem] p-6 text-left ${
              plan.featured ? "theme-callout" : "theme-card"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-semibold theme-heading">
                  {plan.price}
                </p>
              </div>
              {plan.featured ? (
                <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                  Popular
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-7 theme-muted">
              {plan.description}
            </p>
            <ul className="mt-6 space-y-3 text-sm theme-heading">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--primary-strong)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
