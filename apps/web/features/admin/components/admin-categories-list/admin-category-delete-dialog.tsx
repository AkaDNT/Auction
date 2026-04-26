import type { AdminCategoryDeleteDialogProps } from "./types";

export function AdminCategoryDeleteDialog({
  category,
  isOpen,
  isVisible,
  isPending,
  onClose,
  onConfirm,
  dialogRef,
  confirmButtonRef,
}: AdminCategoryDeleteDialogProps) {
  if (!isOpen || !category) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-3 transition-all duration-200 ease-out sm:items-center ${
        isVisible ? "bg-black/50 opacity-100" : "bg-black/0 opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-category-title"
        className={`theme-surface w-full max-w-lg rounded-2xl p-4 shadow-2xl transition-all duration-250 ease-out sm:rounded-3xl sm:p-5 lg:p-6 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-[0.98] opacity-0 sm:translate-y-4"
        }`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-red-700">
              Xác nhận xóa
            </p>
            <h3
              id="delete-category-title"
              className="mt-2 text-xl font-semibold theme-heading"
            >
              Xóa danh mục này?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Đóng
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-sm leading-7 theme-muted">
            Bạn có chắc chắn muốn xóa danh mục{" "}
            <span className="font-semibold theme-heading">{category.label}</span>{" "}
            không? Hành động này không thể hoàn tác.
          </p>

          <div className="rounded-2xl border border-theme-line bg-(--primary-soft)/45 px-4 py-3 text-sm">
            <p className="font-semibold theme-heading">{category.slug}</p>
            <p className="mt-1 theme-muted">
              {category.description || "Chưa có mô tả"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="cursor-pointer theme-button-secondary inline-flex justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="cursor-pointer inline-flex justify-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Đang xóa..." : "Xác nhận xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
