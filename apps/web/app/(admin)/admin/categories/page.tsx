/**
 * Admin Categories Page
 * Route: /admin/categories
 * SOLID: Single Responsibility - displays category management page
 */

"use client";

import { useState } from "react";
import { AdminCategoriesList } from "@/features/admin/components";

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState("");

  return (
    <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Danh mục quản trị
          </p>
          <h1 className="mt-2 text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
            Quản lý danh mục đấu giá
          </h1>
          <p className="mt-1 text-xs theme-muted sm:text-sm">
            Tạo, chỉnh sửa và quản lý danh mục cho toàn bộ hệ thống đấu giá.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-3 sm:p-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted sm:mb-2">
            Tìm danh mục
          </span>
          <input
            type="text"
            placeholder="Nhập tên hiển thị, đường dẫn hoặc mô tả"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
          />
        </label>
      </div>

      <div className="mt-5">
        <AdminCategoriesList search={search} />
      </div>
    </section>
  );
}
