import type { FormEvent } from "react";
import type { AuctionApiCategory } from "@/features/auction/types/auction-api";
import type {
  EditFormState,
  SellerAuctionActiveAction,
} from "@/features/auction/types/seller-auction-detail";
import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";

type SellerAuctionEditModalProps = {
  isOpen: boolean;
  editForm: EditFormState | null;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState | null>>;
  activeAction: SellerAuctionActiveAction;
  categories: AuctionApiCategory[];
  isCategoriesLoading: boolean;
  isCategoriesError: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SellerAuctionEditModal({
  isOpen,
  editForm,
  setEditForm,
  activeAction,
  categories,
  isCategoriesLoading,
  isCategoriesError,
  onClose,
  onSubmit,
}: SellerAuctionEditModalProps) {
  if (!isOpen || !editForm) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="theme-surface w-full max-w-4xl rounded-3xl p-4 sm:p-5"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold theme-heading sm:text-xl">
            Chỉnh sửa phiên đấu giá
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft)"
          >
            Đóng
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Tiêu đề phiên đấu giá
              </span>
              <input
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev ? { ...prev, title: event.target.value } : prev,
                  )
                }
                required
                maxLength={255}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Mô tả
              </span>
              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          description: event.target.value,
                        }
                      : prev,
                  )
                }
                rows={4}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Danh mục
              </span>
              <select
                value={editForm.categoryId}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          categoryId: event.target.value,
                        }
                      : prev,
                  )
                }
                required
                disabled={isCategoriesLoading || isCategoriesError}
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getVietnameseCategoryLabel(category.slug, category.label)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Giá khởi điểm (VND)
              </span>
              <input
                type="number"
                min={0}
                step="1000"
                value={editForm.startingPrice}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          startingPrice: event.target.value,
                        }
                      : prev,
                  )
                }
                required
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Giá mua ngay
              </span>
              <input
                type="number"
                min={0}
                step="1000"
                value={editForm.buyNowPrice}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          buyNowPrice: event.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Bước giá tối thiểu
              </span>
              <input
                type="number"
                min={1001}
                step="1"
                value={editForm.minBidIncrement}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          minBidIncrement: event.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Bắt đầu lúc
              </span>
              <input
                type="datetime-local"
                value={editForm.startAt}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          startAt: event.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Kết thúc lúc
              </span>
              <input
                type="datetime-local"
                value={editForm.endAt}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          endAt: event.target.value,
                        }
                      : prev,
                  )
                }
                required
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Ảnh đại diện URL
              </span>
              <input
                type="url"
                value={editForm.thumbnailUrl}
                onChange={(event) =>
                  setEditForm((prev) =>
                    prev
                      ? {
                          ...prev,
                          thumbnailUrl: event.target.value,
                        }
                      : prev,
                  )
                }
                className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
              />
            </label>
          </div>

          {isCategoriesError ? (
            <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              Không thể tải danh mục đấu giá. Vui lòng thử lại sau.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={activeAction !== null}
              className="theme-button-primary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeAction === "edit" ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={activeAction === "edit"}
              className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
