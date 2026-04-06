import Image from "next/image";

import { getAuctionImage } from "@/shared/lib/mock-images";

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
          Chi tiết lô
        </p>
        <h2 className="mt-4 text-2xl font-semibold theme-heading">
          Phiên #{id}
        </h2>
        <div className="relative mt-5 h-44 overflow-hidden rounded-2xl border border-[color:var(--border)] sm:h-56">
          <Image
            src={getAuctionImage(id)}
            alt={`Lô đấu giá ${id}`}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <p className="mt-3 text-sm leading-7 theme-muted">
          Một góc nhìn tập trung cho trạng thái lô, định giá và hoạt động đặt
          giá trực tiếp.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Thông số
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm theme-muted">Giá khởi điểm</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">
                $28,000
              </dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Giá sàn</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">Có</dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Tình trạng</dt>
              <dd className="mt-1 text-lg font-semibold theme-heading">
                Đã xác minh
              </dd>
            </div>
            <div>
              <dt className="text-sm theme-muted">Trạng thái</dt>
              <dd className="mt-1 text-lg font-semibold theme-primary">
                Đang đấu giá
              </dd>
            </div>
          </dl>
        </article>

        <article className="theme-card rounded-[1.75rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] theme-primary">
            Lịch sử đặt giá
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
