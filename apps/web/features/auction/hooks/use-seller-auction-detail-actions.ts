import { FormEvent, useState } from "react";

import {
  cancelSellerAuction,
  deleteSellerAuction,
  publishSellerAuction,
  updateSellerAuction,
  type UpdateSellerAuctionPayload,
} from "@/features/auction/services/seller-auction-detail";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";
import type {
  EditFormState,
  SellerAuctionActiveAction,
  SellerAuctionConfirmAction,
} from "@/features/auction/types/seller-auction-detail";
import {
  toEditFormState,
  toIsoDateTime,
  toOptionalNumber,
} from "@/features/auction/utils/seller-auction-detail-utils";

type UseSellerAuctionDetailActionsOptions = {
  auction: AuctionApiItem | undefined;
  onRefresh: () => Promise<void>;
  onAfterDelete: () => void;
  setErrorMessage: (value: string | null) => void;
  setSuccessMessage: (value: string | null) => void;
  setToastMessage: (value: string | null) => void;
};

export function useSellerAuctionDetailActions({
  auction,
  onRefresh,
  onAfterDelete,
  setErrorMessage,
  setSuccessMessage,
  setToastMessage,
}: UseSellerAuctionDetailActionsOptions) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [confirmAction, setConfirmAction] =
    useState<SellerAuctionConfirmAction>(null);
  const [activeAction, setActiveAction] =
    useState<SellerAuctionActiveAction>(null);

  const openEditPopup = () => {
    if (!auction) {
      return;
    }

    if (auction.status !== "DRAFT") {
      setErrorMessage("Chỉ có thể chỉnh sửa phiên ở trạng thái nháp.");
      setSuccessMessage(null);
      return;
    }

    setEditForm(toEditFormState(auction));
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditOpen(true);
  };

  const closeEditPopup = () => {
    if (activeAction === "edit") {
      return;
    }

    setIsEditOpen(false);
  };

  const handlePublish = async () => {
    if (!auction) {
      return;
    }

    setActiveAction("publish");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await publishSellerAuction(auction.id);
      await onRefresh();
      setSuccessMessage("Phát hành phiên đấu giá thành công.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể phát hành phiên.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const handleCancel = async () => {
    if (!auction) {
      return;
    }

    setConfirmAction(null);
    setActiveAction("cancel");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await cancelSellerAuction(auction.id);
      await onRefresh();
      setSuccessMessage("Hủy phiên đấu giá thành công.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể hủy phiên.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const handleDelete = async () => {
    if (!auction) {
      return;
    }

    setConfirmAction(null);
    setActiveAction("delete");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteSellerAuction(auction.id);
      setToastMessage("Xóa phiên đấu giá thành công.");
      onAfterDelete();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể xóa phiên.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!auction || !editForm) {
      return;
    }

    const title = editForm.title.trim();
    const startingPrice = Number(editForm.startingPrice);
    const buyNowPrice = toOptionalNumber(editForm.buyNowPrice);
    const minBidIncrement = toOptionalNumber(editForm.minBidIncrement);
    const startAt = editForm.startAt
      ? toIsoDateTime(editForm.startAt)
      : undefined;
    const endAt = editForm.endAt ? toIsoDateTime(editForm.endAt) : undefined;

    if (!title) {
      setErrorMessage("Vui lòng nhập tiêu đề phiên đấu giá.");
      setSuccessMessage(null);
      return;
    }

    if (!editForm.categoryId) {
      setErrorMessage("Vui lòng chọn danh mục đấu giá.");
      setSuccessMessage(null);
      return;
    }

    if (!Number.isFinite(startingPrice) || startingPrice < 0) {
      setErrorMessage("Giá khởi điểm phải là số lớn hơn hoặc bằng 0.");
      setSuccessMessage(null);
      return;
    }

    if (!endAt) {
      setErrorMessage("Vui lòng chọn thời gian kết thúc hợp lệ.");
      setSuccessMessage(null);
      return;
    }

    if (startAt && new Date(startAt).getTime() >= new Date(endAt).getTime()) {
      setErrorMessage("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
      setSuccessMessage(null);
      return;
    }

    if (buyNowPrice !== undefined && buyNowPrice < startingPrice) {
      setErrorMessage("Giá mua ngay phải lớn hơn hoặc bằng giá khởi điểm.");
      setSuccessMessage(null);
      return;
    }

    if (minBidIncrement !== undefined && minBidIncrement < 1001) {
      setErrorMessage("Bước giá tối thiểu phải lớn hơn hoặc bằng 1001.");
      setSuccessMessage(null);
      return;
    }

    const payload: UpdateSellerAuctionPayload = {
      title,
      description: editForm.description.trim() || undefined,
      startingPrice,
      buyNowPrice,
      minBidIncrement,
      startAt,
      endAt,
      thumbnailUrl: editForm.thumbnailUrl.trim() || undefined,
      categoryId: editForm.categoryId,
    };

    setActiveAction("edit");
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateSellerAuction(auction.id, payload);
      await onRefresh();
      setSuccessMessage("Cập nhật phiên đấu giá thành công.");
      setIsEditOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể cập nhật phiên.",
      );
    } finally {
      setActiveAction(null);
    }
  };

  return {
    isEditOpen,
    editForm,
    setEditForm,
    confirmAction,
    setConfirmAction,
    activeAction,
    openEditPopup,
    closeEditPopup,
    handlePublish,
    handleCancel,
    handleDelete,
    handleEditSubmit,
  };
}
