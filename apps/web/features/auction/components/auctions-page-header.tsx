"use client";

import Link from "next/link";
import Image from "next/image";

import { auctionCategories, sortOptions } from "../mocks/auctions.mock";
import { mockImages } from "@/shared/lib/mock-images";
import { AuthUserMenu } from "@/features/auth/components/auth-user-menu";
import { useAuthUser } from "@/features/auth/services/auth-user.store";
import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";

export function AuctionsPageHeader() {
  const user = useAuthUser();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
      <div className="overflow-hidden rounded-4xl border border-theme-line bg-theme-panel">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-theme-brand">
              Sàn đấu giá trực tiếp
            </p>
            <h1 className="font-display text-3xl font-semibold leading-tight text-theme-heading sm:text-4xl lg:text-5xl">
              Trung tâm đấu giá cao cấp với trải nghiệm trực tiếp, minh bạch và
              tốc độ ra lệnh cao
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-theme-muted sm:text-base">
              Tập trung mọi phiên đấu giá giá trị cao vào một không gian vận
              hành trực quan: lọc nhanh danh mục, theo dõi biến động và vào live
              room chỉ trong một nhịp.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Phiên trực tuyến
                </p>
                <p className="mt-1 text-xl font-semibold text-theme-heading">
                  {auctionCategories.reduce((sum, item) => sum + item.count, 0)}
                  +
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Danh mục chính
                </p>
                <p className="mt-1 text-xl font-semibold text-theme-heading">
                  {auctionCategories.length}
                </p>
              </div>
              <div className="rounded-2xl border border-theme-line bg-theme-bg p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-theme-muted">
                  Khung live
                </p>
                <p className="mt-1 text-xl font-semibold text-theme-heading">
                  24/7
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {auctionCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/auctions/category/${category.slug}`}
                  className="rounded-full border border-theme-line bg-theme-bg px-3 py-1.5 text-xs font-medium text-theme-muted transition hover:border-theme-brand/50 hover:text-theme-heading"
                >
                  {getVietnameseCategoryLabel(category.slug, category.label)} (
                  {category.count})
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {user ? (
                <AuthUserMenu />
              ) : (
                <>
                  <Link href="/register" className="btn-primary">
                    Bắt đầu đấu giá
                  </Link>
                  <Link href="/login" className="btn-secondary">
                    Đăng nhập tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative h-60 overflow-hidden rounded-3xl border border-theme-line sm:h-72">
              <Image
                src={mockImages.auctionsHeader}
                alt="Không gian đấu giá trực tuyến"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-black/35 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-white/80">
                  Luồng nổi bật hôm nay
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Đồng hồ, xe điện và nghệ thuật sưu tầm
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-theme-line bg-theme-bg p-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted"
                >
                  Danh mục
                </label>
                <select
                  id="category"
                  className="w-full rounded-xl border border-theme-line bg-theme-panel px-3 py-2 text-sm text-theme-heading outline-none focus:ring-2 focus:ring-theme-brand/40"
                >
                  <option>Tất cả danh mục</option>
                  {auctionCategories.map((category) => (
                    <option key={category.slug}>
                      {getVietnameseCategoryLabel(
                        category.slug,
                        category.label,
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="sort"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-theme-muted"
                >
                  Sắp xếp
                </label>
                <select
                  id="sort"
                  className="w-full rounded-xl border border-theme-line bg-theme-panel px-3 py-2 text-sm text-theme-heading outline-none focus:ring-2 focus:ring-theme-brand/40"
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
