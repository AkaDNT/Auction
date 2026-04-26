"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "@/features/admin/hooks";
import type { AdminCategory } from "@/features/admin/types";
import {
  AdminCategoriesListProps,
  CategoryFormState,
  initialCategoryFormState,
} from "./admin-categories-list/types";
import { useAnimatedDialog } from "./admin-categories-list/use-animated-dialog";
import { AdminCategoryStats } from "./admin-categories-list/admin-category-stats";
import { AdminCategoriesTable } from "./admin-categories-list/admin-categories-table";
import { AdminCategoryFormDialog } from "./admin-categories-list/admin-category-form-dialog";
import { AdminCategoryDeleteDialog } from "./admin-categories-list/admin-category-delete-dialog";

export function AdminCategoriesList({ search = "" }: AdminCategoriesListProps) {
  const categoriesQuery = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(
    initialCategoryFormState,
  );

  const popupRef = useRef<HTMLDivElement>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const deleteConfirmButtonRef = useRef<HTMLButtonElement>(null);

  const formDialog = useAnimatedDialog({
    isOpen: showForm,
    dialogRef: popupRef,
    focusRef: slugInputRef,
    resetScroll: true,
  });

  const deleteDialog = useAnimatedDialog({
    isOpen: Boolean(deleteTarget),
    dialogRef: deleteDialogRef,
    focusRef: deleteConfirmButtonRef,
  });

  const categories = useMemo(() => {
    const rawCategories = categoriesQuery.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rawCategories;
    }

    return rawCategories.filter((category) => {
      return [category.label, category.slug, category.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [categoriesQuery.data, search]);

  const stats = useMemo(() => {
    return {
      total: categoriesQuery.data?.length ?? categories.length,
      shown: categories.length,
    };
  }, [categories, categoriesQuery.data]);

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormData(initialCategoryFormState);
    setShowForm(true);
  };

  const openEditForm = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      label: category.label,
      description: category.description || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    formDialog.hide(() => {
      setShowForm(false);
      setEditingCategory(null);
      setFormData(initialCategoryFormState);
    });
  };

  const openDeleteDialog = (category: AdminCategory) => {
    setDeleteTarget(category);
  };

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) {
      return;
    }

    deleteDialog.hide(() => {
      setDeleteTarget(null);
    });
  };

  const updateFormField = (field: keyof CategoryFormState, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.id,
          request: {
            slug: formData.slug,
            label: formData.label,
            description: formData.description || undefined,
          },
        });
        toast.success("Danh mục đã được cập nhật thành công.");
      } else {
        await createMutation.mutateAsync({
          slug: formData.slug,
          label: formData.label,
          description: formData.description || undefined,
        });
        toast.success("Danh mục đã được tạo thành công.");
      }

      closeForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể lưu danh mục.";
      toast.error(`Lỗi: ${message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Danh mục đã được xóa thành công.");
      closeDeleteDialog();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa danh mục.";
      toast.error(`Lỗi: ${message}`);
    }
  };

  if (categoriesQuery.isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 rounded-2xl border border-theme-line bg-(--primary-soft)"
            />
          ))}
        </div>
        <div className="h-28 rounded-2xl border border-theme-line bg-(--primary-soft)" />
        <div className="h-112 rounded-2xl border border-theme-line bg-(--primary-soft)" />
      </div>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
        {categoriesQuery.error instanceof Error
          ? categoriesQuery.error.message
          : "Không thể tải danh mục."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AdminCategoryStats total={stats.total} shown={stats.shown} />

      {categories.length === 0 ? (
        <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-6 text-center">
          <p className="text-sm font-semibold theme-heading">
            Chưa có danh mục nào
          </p>
          <p className="mt-2 text-sm theme-muted">
            Tạo danh mục đầu tiên để bắt đầu sắp xếp phiên đấu giá.
          </p>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={openCreateForm}
              className="theme-button-secondary cursor-pointer inline-flex rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Thêm danh mục
            </button>
          </div>
        </div>
      ) : (
        <section className="theme-card rounded-2xl p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] theme-primary">
                Danh sách danh mục
              </p>
              <h2 className="mt-2 text-xl font-semibold theme-heading sm:text-2xl">
                Cấu hình tên hiển thị, nhãn và mô tả
              </h2>
              <p className="mt-1 text-sm theme-muted">
                Sửa nhanh tên hiển thị, nhãn và mô tả của danh mục.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="theme-button-secondary cursor-pointer inline-flex rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Thêm danh mục
            </button>
          </div>

          <AdminCategoriesTable
            categories={categories}
            isDeleting={deleteMutation.isPending}
            onEdit={openEditForm}
            onDelete={openDeleteDialog}
          />
        </section>
      )}

      <AdminCategoryFormDialog
        formData={formData}
        isOpen={showForm}
        isVisible={formDialog.isVisible}
        isPending={isFormPending}
        mode={editingCategory ? "edit" : "create"}
        onChange={updateFormField}
        onClose={closeForm}
        onSubmit={handleSubmit}
        popupRef={popupRef}
        slugInputRef={slugInputRef}
      />

      <AdminCategoryDeleteDialog
        category={deleteTarget}
        isOpen={Boolean(deleteTarget)}
        isVisible={deleteDialog.isVisible}
        isPending={deleteMutation.isPending}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        dialogRef={deleteDialogRef}
        confirmButtonRef={deleteConfirmButtonRef}
      />
    </div>
  );
}
