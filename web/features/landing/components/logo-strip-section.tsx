import { logoItems } from "../mocks/home.mock";
import { SectionShell } from "./section-shell";

export function LogoStripSection() {
  return (
    <SectionShell
      id="logos"
      eyebrow="Trusted by"
      title="Partner logos that suggest a serious operating network"
      description="This band breaks up the page rhythm while reinforcing trust and ecosystem strength."
      align="center"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {logoItems.map((logo) => (
          <article
            key={logo.name}
            className="theme-surface flex items-center gap-4 rounded-[1.5rem] px-5 py-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--primary-strong)] text-base font-black text-[color:var(--primary-foreground)]">
              {logo.accent}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] theme-primary">
                {logo.name}
              </p>
              <p className="text-sm theme-muted">
                Preferred marketplace partner
              </p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
