/**
 * Admin Bids Management Page
 * Route: /admin/bids
 * SOLID: Single Responsibility - displays bids management page
 */

"use client";

import { useMemo, useState } from "react";
import { AdminBidsList } from "@/features/admin/components";
import type { AdminBidListRequest } from "@/features/admin/types";

export default function AdminBidsPage() {
  const [filters, setFilters] = useState<AdminBidListRequest>({
    page: 1,
    limit: 20,
  });

  const handleFilterChange = (newFilters: AdminBidListRequest) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Quản lý lượt đặt giá</h1>
        <p className="mt-2 text-gray-600">
          Xem và quản lý tất cả các lượt đặt giá trên hệ thống
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 md:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-semibold">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tên phiên hoặc người đặt..."
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  search: e.target.value,
                  page: 1,
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold">Trạng thái</label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                handleFilterChange({
                  ...filters,
                  status: (e.target.value as any) || undefined,
                  page: 1,
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="PENDING">Chờ duyệt</option>
            </select>
          </div>
        </div>

        <AdminBidsList request={filters} />
      </section>
    </div>
  );
}
