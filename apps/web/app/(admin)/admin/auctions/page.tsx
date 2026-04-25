/**
 * Admin Auctions List Page
 * Route: /admin/auctions
 * SOLID: Single Responsibility - displays auction management page
 */

"use client";

import { useState } from "react";
import { AdminAuctionsList } from "@/features/admin/components";
import type { AdminAuctionListRequest } from "@/features/admin/types";
import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";

export default function AdminAuctionsPage() {
  const [filters, setFilters] = useState<AdminAuctionListRequest>({
    page: 1,
    limit: 20,
  });
  const categoriesQuery = useAuctionCategories();

  const handleFilterChange = (newFilters: AdminAuctionListRequest) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  return (
    <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Phiên đấu giá quản trị
          </p>
          <h1 className="mt-2 text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
            Quản lý danh sách phiên đấu giá
          </h1>
          <p className="mt-1 text-xs theme-muted sm:text-sm">
            Theo dõi trạng thái, tra cứu nhanh và điều phối phiên đấu giá toàn
            hệ thống.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <label className="block lg:col-span-6">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
              Tìm kiếm phiên
            </span>
            <input
              type="text"
              placeholder="Nhập tên phiên đấu giá..."
              value={filters.search || ""}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  search: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block lg:col-span-6">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
              Người bán
            </span>
            <input
              type="text"
              placeholder="Tên hoặc email người bán"
              value={filters.sellerSearch || ""}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  sellerSearch: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block lg:col-span-4">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
              Danh mục
            </span>
            <select
              value={filters.categoryId || ""}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  categoryId: e.target.value || undefined,
                  page: 1,
                })
              }
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            >
              <option value="">Tất cả danh mục</option>
              {(categoriesQuery.data ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-4">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
              Trạng thái
            </span>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  status: (e.target.value as any) || undefined,
                  page: 1,
                })
              }
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            >
              <option value="">Tất cả</option>
              <option value="DRAFT">Nháp</option>
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="LIVE">Đang diễn ra</option>
              <option value="ENDED">Đã kết thúc</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </label>

          <div className="flex items-end lg:col-span-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="theme-button-secondary inline-flex h-10.5 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <AdminAuctionsList request={filters} />
      </div>
    </section>
  );
}
