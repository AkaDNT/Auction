/**
 * Admin Categories List Component
 * SOLID: Single Responsibility - displays category list with CRUD
 * Dependency: hooks, types
 */

"use client";

import { useMemo, useState } from "react";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from "@/features/admin/hooks";

export function AdminCategoriesList() {
  const categoriesQuery = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0,
  });

  const categories = useMemo(() => {
    return categoriesQuery.data?.data ?? [];
  }, [categoriesQuery.data]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        displayOrder: formData.displayOrder,
      });
      setFormData({ name: "", description: "", displayOrder: 0 });
      setShowForm(false);
      alert("Danh mục đã được tạo thành công");
    } catch {
      alert("Lỗi: Không thể tạo danh mục");
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await deleteMutation.mutateAsync(categoryId);
        alert("Danh mục đã được xóa thành công");
      } catch {
        alert("Lỗi: Không thể xóa danh mục");
      }
    }
  };

  if (categoriesQuery.isLoading) {
    return <div>Đang tải danh mục...</div>;
  }

  if (categoriesQuery.isError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
        Lỗi: Không thể tải danh mục
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {showForm ? "Đóng" : "Thêm danh mục"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-lg border border-gray-200 p-6"
        >
          <div>
            <label className="block text-sm font-semibold">Tên danh mục</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">
              Thứ tự hiển thị
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  displayOrder: parseInt(e.target.value),
                })
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            {createMutation.isPending ? "Đang tạo..." : "Tạo danh mục"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold">Tên</th>
              <th className="px-4 py-2 text-left font-semibold">Mô tả</th>
              <th className="px-4 py-2 text-left font-semibold">Phiên</th>
              <th className="px-4 py-2 text-left font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-gray-200">
                <td className="px-4 py-2">{category.name}</td>
                <td className="px-4 py-2">{category.description || "-"}</td>
                <td className="px-4 py-2">{category.auctionCount}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
