/**
 * Admin Categories Page
 * Route: /admin/categories
 * SOLID: Single Responsibility - displays category management page
 */

"use client";

import { AdminCategoriesList } from "@/features/admin/components";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <p className="mt-2 text-gray-600">
          Tạo, cập nhật và xóa danh mục sản phẩm cho các phiên đấu giá
        </p>
      </section>

      <AdminCategoriesList />
    </div>
  );
}
