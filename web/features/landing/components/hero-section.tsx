import Link from "next/link";
import Image from "next/image";

import { heroMetrics } from "../mocks/home.mock";
import { mockImages } from "@/shared/lib/mock-images";

export function HeroSection() {
  return (
    <section
      id="home"
      className="theme-hero relative overflow-hidden border-b border-[color:var(--border)]"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20 xl:max-w-[76rem] xl:gap-10 xl:py-16 2xl:max-w-[80rem] 2xl:py-14">
        <div className="flex flex-col justify-center">
          <span className="theme-eyebrow mb-5 w-fit">
            Nền tảng đấu giá cao cấp
          </span>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight theme-heading sm:text-5xl lg:text-6xl xl:text-[3.35rem] xl:leading-[1.06] 2xl:text-[3.6rem]">
            Trải nghiệm đấu giá doanh nghiệp được thiết kế để biến niềm tin
            thành tốc độ chốt giá.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 theme-muted sm:mt-6 sm:text-lg xl:mt-5 xl:max-w-xl xl:text-base xl:leading-7">
            Kiến trúc sàn giao dịch dành cho người mua, người bán và đội vận
            hành cần đặt giá minh bạch, thanh toán rõ ràng và trải nghiệm nhất
            quán từ khám phá đến tất toán.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:mt-7">
            <Link
              href="/auctions"
              className="theme-button-primary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              Khám phá phiên đấu giá
            </Link>
            <Link
              href="/register"
              className="theme-button-secondary inline-flex w-full justify-center rounded-full px-6 py-3 text-sm font-semibold transition sm:w-auto"
            >
              Mở tài khoản ngay
            </Link>
          </div>
        </div>

        <div className="relative lg:max-w-[34rem] lg:justify-self-end xl:max-w-[31rem] 2xl:max-w-[30rem]">
          <div className="absolute inset-0 rounded-[2rem] bg-[color:var(--primary-soft)] blur-3xl" />
          <div className="theme-surface relative rounded-[2rem] p-4 sm:p-6 xl:p-5">
            <div className="relative mb-4 h-36 overflow-hidden rounded-[1.5rem] border border-[color:var(--border)] sm:h-44 xl:h-36 2xl:h-32">
              <Image
                src={mockImages.homeHero}
                alt="Phiên đấu giá nổi bật"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
            <div className="theme-surface-strong rounded-[1.5rem] p-4 sm:p-5 xl:p-4">
              <div className="flex flex-col gap-2 border-b border-[color:var(--border)] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] theme-primary">
                    Nhịp thị trường trực tiếp
                  </p>
                  <p className="mt-1 text-lg font-semibold theme-heading sm:text-xl">
                    Các lô nổi bật hôm nay
                  </p>
                </div>
                <span className="inline-flex w-fit self-start rounded-full border border-theme-brand/30 bg-theme-brand/10 px-3 py-1 text-xs font-semibold text-theme-brand sm:self-auto">
                  12 đang mở
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:mt-3 xl:gap-2.5">
                {heroMetrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className={`theme-card rounded-2xl p-3 xl:p-2.5 ${
                      index === heroMetrics.length - 1 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-2xl font-semibold theme-primary xl:text-xl">
                        {metric.value}
                      </p>
                      <p className="text-xs uppercase tracking-[0.22em] theme-muted xl:tracking-[0.18em]">
                        {metric.label}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-5 theme-muted sm:text-sm xl:text-xs xl:leading-4">
                      {metric.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="theme-callout mt-4 rounded-2xl p-3.5 sm:p-4 xl:mt-3 xl:p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] theme-primary sm:text-sm">
                  Khung giờ chốt tiếp theo
                </p>
                <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold theme-heading sm:text-xl xl:text-lg">
                      18:45 UTC
                    </p>
                    <p className="text-xs theme-muted sm:text-sm">
                      Bộ sưu tập đồng hồ cao cấp và xe phiên bản giới hạn.
                    </p>
                  </div>
                  <p className="text-left text-xs theme-muted sm:text-right sm:text-sm">
                    Sẵn sàng tất toán
                    <br />
                    đã kiểm tra tuân thủ
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
