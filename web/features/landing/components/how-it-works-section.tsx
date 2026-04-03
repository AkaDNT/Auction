import { stepItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function HowItWorksSection() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrow="How it works"
      title="A clear operating model from onboarding to settlement"
      description="The experience is laid out as a simple, repeatable flow so every user knows what happens next."
    >
      <div className="grid gap-5 xl:grid-cols-4">
        {stepItems.map((step) => (
          <article key={step.step} className="theme-card rounded-[1.75rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
              Step {step.step}
            </p>
            <h3 className="mt-4 text-xl font-semibold theme-heading">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 theme-muted">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
