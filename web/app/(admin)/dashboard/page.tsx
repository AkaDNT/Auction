const overviewCards = [
  { label: "Live auctions", value: "42", note: "6 closing today" },
  { label: "Active sellers", value: "186", note: "14 awaiting approval" },
  { label: "Bid volume", value: "$18.4M", note: "+12% vs last week" },
  {
    label: "Conversion rate",
    value: "68%",
    note: "Healthy marketplace momentum",
  },
];

const recentLots = [
  {
    name: "Rolex Daytona 2024",
    status: "Bidding",
    bids: "24 bids",
    amount: "$42,000",
  },
  {
    name: "Tesla Model S Plaid",
    status: "Review",
    bids: "18 bids",
    amount: "$86,500",
  },
  {
    name: "Collector Art Set",
    status: "Scheduled",
    bids: "9 bids",
    amount: "$13,200",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <article key={card.label} className="theme-card rounded-[1.5rem] p-6">
            <p className="text-sm uppercase tracking-[0.35em] theme-primary">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-semibold theme-heading">
              {card.value}
            </p>
            <p className="mt-3 text-sm theme-muted">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="theme-callout rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Marketplace pulse
          </p>
          <h2 className="mt-4 text-2xl font-semibold theme-heading">
            Today&apos;s operational focus
          </h2>
          <p className="mt-3 text-sm leading-7 theme-muted">
            Monitor lot readiness, confirm seller approvals, and push the
            highest-value auctions through the final close window.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">12</p>
              <p className="mt-2 text-sm theme-muted">Lots pending review</p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">8</p>
              <p className="mt-2 text-sm theme-muted">
                Payments awaiting capture
              </p>
            </div>
            <div className="theme-surface-strong rounded-2xl p-4">
              <p className="text-2xl font-semibold theme-primary">4</p>
              <p className="mt-2 text-sm theme-muted">Escalations to resolve</p>
            </div>
          </div>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] theme-primary">
                Recent lots
              </p>
              <h2 className="mt-2 text-2xl font-semibold theme-heading">
                High-priority inventory
              </h2>
            </div>
            <span className="theme-eyebrow">Live feed</span>
          </div>
          <div className="mt-6 space-y-4">
            {recentLots.map((lot) => (
              <div
                key={lot.name}
                className="rounded-2xl border border-[color:var(--border)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold theme-heading">{lot.name}</p>
                    <p className="mt-1 text-sm theme-muted">{lot.bids}</p>
                  </div>
                  <span className="theme-eyebrow px-3 py-1 text-[0.65rem] tracking-[0.28em]">
                    {lot.status}
                  </span>
                </div>
                <p className="mt-3 text-lg font-semibold theme-primary">
                  {lot.amount}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
