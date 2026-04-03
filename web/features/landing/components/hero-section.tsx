import Link from "next/link";

import { heroMetrics } from "../mocks/home.mock";

export function HeroSection() {
  return (
    <section
      id="home"
      className="theme-hero relative overflow-hidden border-b border-[color:var(--border)]"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <span className="theme-eyebrow mb-5 w-fit">
            Premium auction platform
          </span>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight theme-heading sm:text-5xl lg:text-7xl">
            Enterprise auction UX built to convert trust into faster bids.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 theme-muted sm:mt-6 sm:text-lg">
            Bold marketplace architecture for buyers, sellers, and operations
            teams that need transparent bidding, clean settlement, and a premium
            experience from discovery to close.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="#features"
              className="theme-button-primary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              Explore platform
            </Link>
            <Link
              href="#how-it-works"
              className="theme-button-secondary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              See workflow
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-[color:var(--primary-soft)] blur-3xl" />
          <div className="theme-surface relative rounded-[2rem] p-4 sm:p-6">
            <div className="theme-surface-strong rounded-[1.5rem] p-4 sm:p-5">
              <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] theme-primary">
                    Live market pulse
                  </p>
                  <p className="mt-2 text-xl font-semibold theme-heading sm:text-2xl">
                    Tonight&apos;s featured lots
                  </p>
                </div>
                <span className="inline-flex w-fit self-start rounded-full border border-[#6366f1]/30 bg-[#6366f1]/10 px-3 py-1 text-xs font-semibold text-[#6366f1] sm:self-auto">
                  12 active
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {heroMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="theme-card rounded-2xl p-4"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-3xl font-semibold theme-primary">
                        {metric.value}
                      </p>
                      <p className="text-sm uppercase tracking-[0.3em] theme-muted">
                        {metric.label}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 theme-muted">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="theme-callout mt-5 rounded-2xl p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] theme-primary">
                  Next close window
                </p>
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xl font-semibold theme-heading sm:text-2xl">
                      18:45 UTC
                    </p>
                    <p className="text-sm theme-muted">
                      Luxury watch collection and rare edition vehicles.
                    </p>
                  </div>
                  <p className="text-left text-sm theme-muted sm:text-right">
                    Settlement ready
                    <br />
                    compliance checked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
