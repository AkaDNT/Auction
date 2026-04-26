import type { AdminCategoryFormDialogProps } from "./types";

export function AdminCategoryFormDialog({
  formData,
  isOpen,
  isVisible,
  isPending,
  mode,
  onChange,
  onClose,
  onSubmit,
  popupRef,
  slugInputRef,
}: AdminCategoryFormDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isEditing = mode === "edit";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-3 transition-all duration-200 ease-out sm:items-center ${
        isVisible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"
      }`}
    >
      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        className={`theme-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-4 shadow-2xl transition-all duration-250 ease-out sm:rounded-3xl sm:p-5 lg:p-6 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.98] opacity-0 sm:translate-y-4"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] theme-primary">
              {isEditing ? "Cập nhật danh mục" : "Tạo danh mục"}
            </p>
            <h3
              id="category-form-title"
              className="mt-2 text-xl font-semibold theme-heading"
            >
              {isEditing ? "Cập nhật danh mục" : "Thêm danh mục đấu giá mới"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft)"
          >
            Đóng
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                nhãn
              </span>
              <input
                ref={slugInputRef}
                type="text"
                value={formData.slug}
                onChange={(event) => onChange("slug", event.target.value)}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
                placeholder="vi-du-danh-muc"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Tên hiển thị
              </span>
              <input
                type="text"
                value={formData.label}
                onChange={(event) => onChange("label", event.target.value)}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
                placeholder="Tên hiển thị của danh mục"
                required
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Mô tả
              </span>
              <textarea
                value={formData.description}
                onChange={(event) => onChange("description", event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
                placeholder="Mô tả ngắn cho danh mục"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer theme-button-secondary inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer inline-flex justify-center rounded-full border border-theme-line bg-theme-brand px-4 py-2 text-sm font-semibold text-theme-brand-foreground transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEditing
                ? isPending
                  ? "Đang lưu..."
                  : "Lưu thay đổi"
                : isPending
                  ? "Đang tạo..."
                  : "Tạo danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
