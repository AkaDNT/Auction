const lots = [
  { title: "Luxury Watches", count: "18 lots", status: "High demand" },
  { title: "Electric Vehicles", count: "9 lots", status: "Processing" },
  { title: "Collector Items", count: "14 lots", status: "Scheduled" },
];

export default function LotsPage() {
  return (
    <div className="space-y-6">
      <section className="theme-callout rounded-[1.75rem] p-6">
        <p className="text-sm uppercase tracking-[0.35em] theme-primary">
          Lots
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Inventory management overview
        </h2>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Organize listings, check approval states, and move inventory through
          the auction pipeline.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {lots.map((lot) => (
          <article key={lot.title} className="theme-card rounded-[1.5rem] p-6">
            <p className="text-xl font-semibold theme-heading">{lot.title}</p>
            <p className="mt-3 text-sm theme-muted">{lot.count}</p>
            <p className="mt-5 theme-primary">{lot.status}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
