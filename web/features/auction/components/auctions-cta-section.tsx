import Link from "next/link";
import Image from "next/image";

import { mockImages } from "@/shared/lib/mock-images";

export function AuctionsCtaSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <div className="relative overflow-hidden rounded-3xl border border-theme-line bg-theme-panel p-7 sm:p-10">
        <div className="absolute inset-0 opacity-20">
          <Image
            src={mockImages.auctionsHeader}
            alt="Background đấu giá"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-theme-bg/95 via-theme-bg/88 to-theme-bg/78" />

        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-theme-brand">
            Sẵn sàng tham gia?
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-theme-heading sm:text-3xl">
            Tạo tài khoản để vào phòng live và đặt lệnh ngay khi thị trường mở
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-theme-muted sm:text-base">
            Hoàn tất xác thực hồ sơ chỉ trong vài bước, sau đó kích hoạt đầy đủ
            quyền tham gia cho cả vai trò người mua và người bán.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary">
              Đăng ký ngay
            </Link>
            <Link href="/login" className="btn-secondary">
              Tôi đã có tài khoản
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
