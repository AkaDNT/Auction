"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { SellerAuctionConfirmDialog } from "@/features/auction/components/seller-auction-confirm-dialog";
import { SellerAuctionDetailOverview } from "@/features/auction/components/seller-auction-detail-overview";
import { SellerAuctionEditModal } from "@/features/auction/components/seller-auction-edit-modal";
import { SellerAuctionImageManager } from "@/features/auction/components/seller-auction-image-manager";
import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import { useSellerAuctionDetailActions } from "@/features/auction/hooks/use-seller-auction-detail-actions";
import { useSellerAuctionImageActions } from "@/features/auction/hooks/use-seller-auction-image-actions";
import { getSellerAuctionById } from "@/features/auction/services/seller-auction-detail";

export default function SellerAuctionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoriesQuery = useAuctionCategories();

  const auctionId = useMemo(() => {
    if (!params?.id) {
      return "";
    }

    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params?.id]);

  const auctionQuery = useQuery({
    queryKey: ["seller-auction-detail", auctionId],
    queryFn: () => getSellerAuctionById(auctionId),
    enabled: Boolean(auctionId),
    retry: 1,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const auction = auctionQuery.data;

  const refreshAuctionData = async () => {
    await Promise.all([
      auctionQuery.refetch(),
      queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
      queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
    ]);
  };

  const {
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
  } = useSellerAuctionDetailActions({
    auction,
    onRefresh: refreshAuctionData,
    onAfterDelete: () => {
      void refreshAuctionData();
      window.setTimeout(() => {
        router.replace("/seller/auctions");
      }, 900);
    },
    setErrorMessage,
    setSuccessMessage,
    setToastMessage,
  });

  const {
    sortedAuctionImages,
    activeImageAction,
    activeImageId,
    setDraggedImageId,
    handleImageUpload,
    handleSetPrimaryImage,
    handleDeleteImage,
    handleDropImage,
  } = useSellerAuctionImageActions({
    auction,
    onRefresh: refreshAuctionData,
    setErrorMessage,
    setSuccessMessage,
  });

  if (auctionQuery.isLoading) {
    return (
      <section className="theme-surface rounded-2xl p-4 sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-1/3 rounded-lg bg-(--primary-soft)" />
          <div className="h-10 w-2/3 rounded-lg bg-(--primary-soft)" />
          <div className="h-56 rounded-2xl bg-(--primary-soft)" />
        </div>
      </section>
    );
  }

  if (auctionQuery.isError || !auction) {
    return (
      <section className="theme-surface rounded-2xl p-4 sm:rounded-3xl sm:p-5 lg:rounded-4xl lg:p-6">
        <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {auctionQuery.error instanceof Error
            ? auctionQuery.error.message
            : "Không thể tải chi tiết phiên đấu giá."}
        </p>
        <Link
          href="/seller/auctions"
          className="theme-button-secondary mt-4 inline-flex cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition"
        >
          Quay lại danh sách
        </Link>
      </section>
    );
  }

  const canEdit = auction.status === "DRAFT";

  return (
    <>
      {toastMessage ? (
        <div className="fixed right-4 top-4 z-120 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          {toastMessage}
        </div>
      ) : null}

      <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
        <SellerAuctionDetailOverview auction={auction} />

        <SellerAuctionImageManager
          auctionTitle={auction.title}
          thumbnailUrl={auction.thumbnailUrl}
          images={sortedAuctionImages}
          activeImageAction={activeImageAction}
          activeImageId={activeImageId}
          onImageUpload={handleImageUpload}
          onSetPrimaryImage={(imageId) => {
            void handleSetPrimaryImage(imageId);
          }}
          onDeleteImage={(imageId) => {
            void handleDeleteImage(imageId);
          }}
          onDropImage={(targetImageId) => {
            void handleDropImage(targetImageId);
          }}
          onDragImageStart={setDraggedImageId}
          onDragImageEnd={() => {
            setDraggedImageId(null);
          }}
        />

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={openEditPopup}
            disabled={!canEdit || activeAction !== null}
            title={
              canEdit ? "Chỉnh sửa phiên" : "Chỉ chỉnh sửa được phiên nháp"
            }
            className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            Chỉnh sửa phiên
          </button>

          {auction.status === "DRAFT" ? (
            <button
              type="button"
              onClick={() => {
                void handlePublish();
              }}
              disabled={activeAction !== null}
              className="theme-button-primary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeAction === "publish"
                ? "Đang xuất bản..."
                : "Công khai phiên"}
            </button>
          ) : null}

          {auction.status === "LIVE" ? (
            <button
              type="button"
              onClick={() => {
                setConfirmAction("cancel");
              }}
              disabled={activeAction !== null}
              className="inline-flex cursor-pointer rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeAction === "cancel" ? "Đang hủy..." : "Hủy phiên"}
            </button>
          ) : null}

          {auction.status === "DRAFT" ? (
            <button
              type="button"
              onClick={() => {
                setConfirmAction("delete");
              }}
              disabled={activeAction !== null}
              className="inline-flex cursor-pointer rounded-full border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeAction === "delete" ? "Đang xóa..." : "Xóa phiên"}
            </button>
          ) : null}

          <Link
            href="/seller/auctions"
            className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition"
          >
            Quay lại danh sách
          </Link>
        </div>
      </section>

      <SellerAuctionConfirmDialog
        confirmAction={confirmAction}
        activeAction={activeAction}
        onClose={() => {
          setConfirmAction(null);
        }}
        onConfirmCancel={() => {
          void handleCancel();
        }}
        onConfirmDelete={() => {
          void handleDelete();
        }}
      />

      <SellerAuctionEditModal
        isOpen={isEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        activeAction={activeAction}
        categories={categoriesQuery.data ?? []}
        isCategoriesLoading={categoriesQuery.isLoading}
        isCategoriesError={categoriesQuery.isError}
        onClose={closeEditPopup}
        onSubmit={(event) => {
          void handleEditSubmit(event);
        }}
      />
    </>
  );
}
