type LotDetailPageProps = {
  params: Promise<{ id: string }>;
};

const bidHistory = [
  { bidder: "Bidder A", amount: "$38,000", time: "12:04" },
  { bidder: "Bidder B", amount: "$40,500", time: "12:11" },
  { bidder: "Bidder C", amount: "$42,000", time: "12:19" },
];

export default async function LotDetailPage({ params }: LotDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Lot detail
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Auction #{id}
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          A focused view for lot status, pricing, and live bidder activity.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Specifications
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm theme-muted">Starting price</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">
                $28,000
              </dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Reserve</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">Yes</dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Condition</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">
                Verified
              </dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Status</dt>
              <dd className="mt-1 text-lg font-semibold theme-primary">
                Live bidding
              </dd>
            </div>
          </dl>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Bid history
          </p>
          <div className="mt-5 space-y-4">
            {bidHistory.map((bid) => (
              <div
                key={bid.time}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--border)] p-4"
              >
                <div>
                  <p className="font-semibold theme-heading">{bid.bidder}</p>
                  <p className="mt-1 text-sm theme-muted">{bid.time}</p>
                </div>
                <p className="text-lg font-semibold theme-primary">
                  {bid.amount}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
