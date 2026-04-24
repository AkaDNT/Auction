import { ChangeEvent, useMemo, useState } from "react";

import {
  confirmSellerAuctionImageUpload,
  createSellerAuctionImageUploadUrl,
  deleteSellerAuctionImage,
  setPrimarySellerAuctionImage,
  updateSellerAuctionImage,
  uploadSellerAuctionImageToS3,
} from "@/features/auction/services/seller-auction-detail";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";
import type { SellerAuctionImageAction } from "@/features/auction/types/seller-auction-detail";
import { sortAuctionImages } from "@/features/auction/utils/seller-auction-detail-utils";

type UseSellerAuctionImageActionsOptions = {
  auction: AuctionApiItem | undefined;
  onRefresh: () => Promise<void>;
  setErrorMessage: (value: string | null) => void;
  setSuccessMessage: (value: string | null) => void;
};

export function useSellerAuctionImageActions({
  auction,
  onRefresh,
  setErrorMessage,
  setSuccessMessage,
}: UseSellerAuctionImageActionsOptions) {
  const [activeImageAction, setActiveImageAction] =
    useState<SellerAuctionImageAction>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  const sortedAuctionImages = useMemo(
    () => sortAuctionImages(auction?.images),
    [auction?.images],
  );

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!auction || !files || files.length === 0) {
      return;
    }

    const validTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const selectedFiles = Array.from(files);

    for (const file of selectedFiles) {
      if (!validTypes.has(file.type)) {
        setErrorMessage(
          `File ${file.name} không đúng định dạng. Chỉ hỗ trợ JPG, PNG, WEBP.`,
        );
        setSuccessMessage(null);
        event.target.value = "";
        return;
      }
    }

    setActiveImageAction("upload");
    setActiveImageId(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const sortedCurrentImages = sortAuctionImages(auction.images);
      const hasPrimary = sortedCurrentImages.some((image) => image.isPrimary);
      const maxSortOrder = sortedCurrentImages.reduce(
        (maxValue, image) => Math.max(maxValue, image.sortOrder),
        -1,
      );
      const baseSortOrder = maxSortOrder + 1;

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        const contentType = file.type || "application/octet-stream";
        const shouldSetPrimary = !hasPrimary && index === 0;

        const uploadUrlData = await createSellerAuctionImageUploadUrl(
          auction.id,
          {
            fileName: file.name,
            contentType,
            altText: auction.title,
            sortOrder: baseSortOrder + index,
            isPrimary: shouldSetPrimary,
          },
        );

        await uploadSellerAuctionImageToS3(
          uploadUrlData.uploadUrl,
          file,
          contentType,
        );

        await confirmSellerAuctionImageUpload(auction.id, {
          storageKey: uploadUrlData.storageKey,
          altText: auction.title,
          sortOrder: baseSortOrder + index,
          isPrimary: shouldSetPrimary,
        });
      }

      await onRefresh();
      setSuccessMessage(
        `Upload thành công ${selectedFiles.length} ảnh cho phiên đấu giá.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể upload ảnh.",
      );
    } finally {
      setActiveImageAction(null);
      setActiveImageId(null);
      event.target.value = "";
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!auction) {
      return;
    }

    setActiveImageAction("set-primary");
    setActiveImageId(imageId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await setPrimarySellerAuctionImage(imageId);
      await onRefresh();
      setSuccessMessage("Đã đặt ảnh chính thành công.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể đặt ảnh chính.",
      );
    } finally {
      setActiveImageAction(null);
      setActiveImageId(null);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!auction) {
      return;
    }

    setActiveImageAction("delete");
    setActiveImageId(imageId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteSellerAuctionImage(imageId);
      await onRefresh();
      setSuccessMessage("Đã xóa ảnh khỏi phiên đấu giá.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể xóa ảnh.",
      );
    } finally {
      setActiveImageAction(null);
      setActiveImageId(null);
    }
  };

  const handleDropImage = async (targetImageId: string) => {
    if (!auction || !draggedImageId || draggedImageId === targetImageId) {
      setDraggedImageId(null);
      return;
    }

    const orderedImages = sortAuctionImages(auction.images);
    const fromIndex = orderedImages.findIndex(
      (image) => image.id === draggedImageId,
    );
    const toIndex = orderedImages.findIndex(
      (image) => image.id === targetImageId,
    );

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedImageId(null);
      return;
    }

    const reordered = [...orderedImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    setActiveImageAction("sort");
    setActiveImageId(draggedImageId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updates = reordered
        .map((image, index) => ({ image, index }))
        .filter(({ image, index }) => image.sortOrder !== index)
        .map(({ image, index }) =>
          updateSellerAuctionImage(image.id, {
            sortOrder: index,
          }),
        );

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      await onRefresh();
      setSuccessMessage("Đã cập nhật thứ tự ảnh.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thứ tự ảnh.",
      );
    } finally {
      setActiveImageAction(null);
      setActiveImageId(null);
      setDraggedImageId(null);
    }
  };

  return {
    sortedAuctionImages,
    activeImageAction,
    activeImageId,
    draggedImageId,
    setDraggedImageId,
    handleImageUpload,
    handleSetPrimaryImage,
    handleDeleteImage,
    handleDropImage,
  };
}
