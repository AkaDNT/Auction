import Image from "next/image";
import Link from "next/link";
import { CountdownText } from "./countdown-text";

import {
  auctionCategories,
  liveAuctions,
  sortOptions,
} from "../mocks/auctions.mock";

const statusTabs = [
  "Đang diễn ra",
  "Sắp tới",
  "Sắp hết",
  "Đã kết thúc",
] as const;

const featuredAuctions = liveAuctions.slice(0, 2);

export function AuctionsMarketFlow() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="relative overflow-hidden rounded-[2rem] theme-card p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-theme-brand/60 to-transparent" />
        <div className="pointer-events-none absolute -left-28 top-16 h-56 w-56 rounded-full bg-theme-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-52 w-52 rounded-full bg-theme-brand/10 blur-3xl" />

        <div className="relative space-y-6">
          <header className="space-y-3 border-b border-theme-line pb-6">
            <nav className="text-xs uppercase tracking-[0.16em] text-theme-muted">
              <Link href="/" className="transition hover:text-theme-heading">
                Trang chủ
              </Link>
              <span className="px-2">&gt;</span>
              <span className="text-theme-heading">Đấu giá</span>
            </nav>
            <h1 className="font-display text-3xl font-semibold leading-tight text-theme-heading sm:text-4xl lg:text-[2.65rem]">
              Sàn đấu giá
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-theme-muted sm:text-base">
              Khám phá và quản lý toàn bộ phiên đấu giá trong một không gian
              trực quan, từ live room đến lịch mở phiên sắp tới.
            </p>
          </header>

          <section className="theme-card rounded-2xl p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Tìm sản phẩm
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm..."
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
                />
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Danh mục
                </span>
                <select className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40">
                  <option>Tất cả</option>
                  {auctionCategories.map((category) => (
                    <option key={category.slug}>{category.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Khoảng giá
                </span>
                <select className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40">
                  <option>Tất cả mức giá</option>
                  <option>Dưới 1,000,000</option>
                  <option>Từ 1,000,000 đến 5,000,000</option>
                  <option>Trên 5,000,000</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Trạng thái
                </span>
                <select className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40">
                  <option>Tất cả trạng thái</option>
                  {statusTabs.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Thời gian kết thúc
                </span>
                <select className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40">
                  <option>Mọi mốc thời gian</option>
                  <option>Trong 1 giờ tới</option>
                  <option>Trong ngày hôm nay</option>
                  <option>Tuần này</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                  Người bán
                </span>
                <input
                  type="text"
                  placeholder="Tên người bán..."
                  className="w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2.5 text-sm text-[color:var(--foreground)] placeholder-[color:var(--muted)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40"
                />
              </label>
            </div>
          </section>

          <section className="flex flex-wrap gap-2.5">
            {statusTabs.map((status, index) => (
              <button
                key={status}
                type="button"
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition sm:text-sm ${
                  index === 0
                    ? "border-theme-brand bg-theme-brand text-theme-brand-foreground shadow-[0_10px_28px_color-mix(in_srgb,var(--primary)_28%,transparent)]"
                    : "border-theme-line bg-theme-bg/90 text-theme-muted hover:border-theme-brand/50 hover:text-theme-heading"
                }`}
              >
                {status}
              </button>
            ))}
          </section>

          <section className="theme-card rounded-2xl p-5 sm:p-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">
                Sắp xếp
              </span>
              <select className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40">
                {sortOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-[color:var(--primary)] bg-[color:var(--primary)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
              >
                Lưới
              </button>
              <button
                type="button"
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
              >
                Danh sách
              </button>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
                  Phiên nổi bật
                </p>
                <h2 className="font-display text-2xl font-semibold text-theme-heading">
                  Phiên đấu giá nổi bật
                </h2>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {featuredAuctions.map((auction) => (
                <article
                  key={auction.id}
                  className="theme-card overflow-hidden rounded-2xl"
                >
                  <div className="relative h-48">
                    <Image
                      src={auction.imageUrl}
                      alt={auction.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <p className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 backdrop-blur">
                      {auction.status}
                    </p>
                  </div>
                  <div className="space-y-4 p-5">
                    <h3 className="text-xl font-semibold text-theme-heading">
                      {auction.title}
                    </h3>
                    <p className="text-sm text-theme-muted">
                      Người bán: {auction.seller}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                          Giá hiện tại
                        </p>
                        <p className="mt-2 font-semibold text-theme-heading">
                          {auction.currentBid}
                        </p>
                      </div>
                      <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                          Giá khởi điểm
                        </p>
                        <p className="mt-2 font-semibold text-theme-heading">
                          {auction.startingPrice}
                        </p>
                      </div>
                      <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                          Thời gian
                        </p>
                        <p className="mt-2 font-semibold text-theme-heading">
                          <CountdownText timeEnd={auction.timeEnd} />
                        </p>
                      </div>
                      <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                          Số lượt đặt
                        </p>
                        <p className="mt-2 font-semibold text-theme-heading">
                          {auction.bidCount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
                        {auction.status}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-[color:var(--primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading"
                      >
                        Xem chi tiết
                      </Link>
                      <Link
                        href={`/auctions/${auction.id}/live`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand bg-[color:var(--primary)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-[color:var(--primary-strong)] hover:shadow-[0_16px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                      >
                        Đặt giá ngay
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-end justify-between gap-5">
              <h2 className="font-display text-2xl font-semibold text-theme-heading">
                Danh sách đấu giá
              </h2>
              <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                {liveAuctions.length} kết quả
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {liveAuctions.map((auction) => (
                <article
                  key={auction.id}
                  className="group rounded-2xl border border-theme-line bg-theme-panel/95 p-4 transition-transform hover:-translate-y-1 hover:shadow-[0_18px_38px_color-mix(in_srgb,var(--primary)_16%,transparent)]"
                >
                  <div className="relative mb-3 h-44 overflow-hidden rounded-xl border border-theme-line">
                    <Image
                      src={auction.imageUrl}
                      alt={auction.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  <h3 className="line-clamp-2 text-lg font-semibold text-theme-heading">
                    {auction.title}
                  </h3>
                  <p className="mt-2 text-sm text-theme-muted">
                    Seller: {auction.seller}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                        Giá hiện tại
                      </p>
                      <p className="mt-2 font-semibold text-theme-heading">
                        {auction.currentBid}
                      </p>
                    </div>
                    <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                        Giá khởi điểm
                      </p>
                      <p className="mt-2 font-semibold text-theme-heading">
                        {auction.startingPrice}
                      </p>
                    </div>
                    <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                        Thời gian
                      </p>
                      <p className="mt-2 font-semibold text-theme-heading">
                        <CountdownText timeEnd={auction.timeEnd} />
                      </p>
                    </div>
                    <div className="rounded-lg border border-theme-line bg-theme-bg p-3">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                        Số lượt đặt
                      </p>
                      <p className="mt-2 font-semibold text-theme-heading">
                        {auction.bidCount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-theme-line bg-theme-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-theme-muted">
                      {auction.status}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand/55 bg-[color:var(--primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand transition hover:border-theme-brand hover:bg-theme-brand/15 hover:text-theme-heading"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      href={`/auctions/${auction.id}/live`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-theme-brand bg-[color:var(--primary)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--primary-foreground)] shadow-[0_12px_28px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition hover:-translate-y-0.5 hover:bg-[color:var(--primary-strong)] hover:shadow-[0_16px_32px_color-mix(in_srgb,var(--primary)_45%,transparent)]"
                    >
                      Đặt giá ngay
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center justify-center gap-4 border-t border-theme-line pt-6 sm:flex-row sm:justify-between">
            <p className="text-sm text-theme-muted">Trang 1 / 12</p>
            <button type="button" className="btn-secondary">
              Xem thêm
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}
