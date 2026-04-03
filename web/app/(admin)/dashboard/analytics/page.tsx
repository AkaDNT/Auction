const metrics = [
  { label: "Avg. watch time", value: "14m 32s" },
  { label: "Bid depth", value: "7.8x" },
  { label: "Repeat buyers", value: "61%" },
  { label: "Settlement speed", value: "1.2 days" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article
            key={metric.label}
            className="theme-card rounded-[1.5rem] p-6"
          >
            <p className="text-sm uppercase tracking-[0.35em] theme-primary">
              {metric.label}
            </p>
            <p className="mt-4 text-3xl font-semibold theme-heading">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="theme-callout rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Trend view
          </p>
          <h2 className="mt-4 text-2xl font-semibold theme-heading">
            Performance over the last 30 days
          </h2>
          <div className="mt-6 flex min-h-64 items-end gap-3 rounded-[1.5rem] border border-[color:var(--border)] p-4">
            {[42, 58, 50, 74, 66, 82, 91].map((height, index) => (
              <div key={index} className="flex-1">
                <div
                  className="rounded-t-2xl bg-[color:var(--primary-strong)]"
                  style={{ height: `${height}%`, minHeight: "5rem" }}
                />
              </div>
            ))}
          </div>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Insight summary
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-7 theme-muted">
            <li>
              • Premium categories continue to outperform standard listings by a
              wide margin.
            </li>
            <li>
              • Closing windows under 24 hours are driving the strongest
              conversion rates.
            </li>
            <li>
              • Seller onboarding time is the main operational bottleneck to
              improve next.
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
}
