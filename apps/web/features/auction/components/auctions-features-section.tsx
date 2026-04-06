import { auctionFeatures } from "../mocks/auctions.mock";

export function AuctionsFeaturesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="mb-5 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
          Lợi thế nền tảng
        </p>
        <h2 className="font-display text-2xl font-semibold text-theme-heading sm:text-3xl">
          Bộ máy vận hành tối ưu cho các phiên giá trị cao
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {auctionFeatures.map((feature, index) => (
          <article
            key={feature.title}
            className={`rounded-2xl border border-theme-line bg-theme-panel p-5 ${
              index === 1 ? "md:-translate-y-2" : ""
            }`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
              0{index + 1}
            </p>
            <h3 className="mb-2 text-lg font-semibold leading-snug text-theme-heading">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-theme-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
