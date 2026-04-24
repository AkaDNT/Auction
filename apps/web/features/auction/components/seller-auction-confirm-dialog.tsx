import type {
  SellerAuctionActiveAction,
  SellerAuctionConfirmAction,
} from "@/features/auction/types/seller-auction-detail";

type SellerAuctionConfirmDialogProps = {
  confirmAction: SellerAuctionConfirmAction;
  activeAction: SellerAuctionActiveAction;
  onClose: () => void;
  onConfirmCancel: () => void;
  onConfirmDelete: () => void;
};

export function SellerAuctionConfirmDialog({
  confirmAction,
  activeAction,
  onClose,
  onConfirmCancel,
  onConfirmDelete,
}: SellerAuctionConfirmDialogProps) {
  if (!confirmAction) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={() => {
        if (activeAction !== null) {
          return;
        }
        onClose();
      }}
    >
      <div
        className="theme-surface w-full max-w-lg rounded-3xl p-5"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h3 className="text-lg font-semibold theme-heading">
          {confirmAction === "cancel"
            ? "Xác nhận hủy phiên"
            : "Xác nhận xóa phiên"}
        </h3>
        <p className="mt-2 text-sm leading-7 theme-muted">
          {confirmAction === "cancel"
            ? "Bạn có chắc chắn muốn hủy phiên đấu giá đang diễn ra này không?"
            : "Bạn có chắc chắn muốn xóa phiên nháp này? Hành động này không thể hoàn tác."}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={activeAction !== null}
            onClick={() => {
              if (confirmAction === "cancel") {
                onConfirmCancel();
                return;
              }
              onConfirmDelete();
            }}
            className="inline-flex cursor-pointer rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmAction === "cancel"
              ? activeAction === "cancel"
                ? "Đang hủy..."
                : "Xác nhận hủy"
              : activeAction === "delete"
                ? "Đang xóa..."
                : "Xác nhận xóa"}
          </button>

          <button
            type="button"
            disabled={activeAction !== null}
            onClick={onClose}
            className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
