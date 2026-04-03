import Link from "next/link";

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative overflow-hidden py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="theme-callout rounded-[2rem] px-5 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary">
              Ready to launch
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight theme-heading sm:text-4xl">
              Build a premium auction flow that feels credible from the first
              impression.
            </h2>
            <p className="mt-4 text-sm leading-7 theme-muted sm:text-base">
              Start with the public experience, then extend the same design
              system into admin and auth when the product scope expands.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-0">
            <Link
              href="#home"
              className="theme-button-primary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              Register interest
            </Link>
            <Link
              href="#pricing"
              className="theme-button-secondary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              Review plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
