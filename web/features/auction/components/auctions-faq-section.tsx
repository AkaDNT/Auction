import { auctionFaqs } from "../mocks/auctions.mock";

export function AuctionsFaqSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-theme-line bg-theme-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-theme-heading sm:text-3xl">
            Câu hỏi thường gặp
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-theme-muted">
            Trả lời nhanh các vấn đề thường gặp khi vào phiên, đặt lệnh và hoàn
            tất thanh toán sau khi thắng đấu giá.
          </p>
          <div className="mt-5 rounded-2xl border border-theme-line bg-theme-bg p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
              Hỗ trợ doanh nghiệp
            </p>
            <p className="mt-1 text-lg font-semibold text-theme-heading">
              24/7 Operation Desk
            </p>
            <p className="mt-1 text-sm text-theme-muted">
              SLA phản hồi trong vòng 15 phút với phiên live đang mở.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {auctionFaqs.map((item, index) => (
            <article
              key={item.question}
              className="rounded-2xl border border-theme-line bg-theme-panel p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-brand">
                Q{index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold text-theme-heading sm:text-lg">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-theme-muted">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
