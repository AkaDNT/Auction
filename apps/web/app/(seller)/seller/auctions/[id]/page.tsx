"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import {
  cancelSellerAuction,
  deleteSellerAuction,
  getSellerAuctionById,
  publishSellerAuction,
  updateSellerAuction,
  type UpdateSellerAuctionPayload,
} from "@/features/auction/services/seller-auction-detail";
import type { AuctionApiStatus } from "@/features/auction/types/auction-api";

type EditFormState = {
  title: string;
  description: string;
  startingPrice: string;
  buyNowPrice: string;
  minBidIncrement: string;
  startAt: string;
  endAt: string;
  thumbnailUrl: string;
  categoryId: string;
};

function statusLabel(status: AuctionApiStatus): string {
  if (status === "DRAFT") {
    return "Nháp";
  }

  if (status === "UPCOMING") {
    return "Sắp diễn ra";
  }

  if (status === "LIVE") {
    return "Đang diễn ra";
  }

  if (status === "ENDED") {
    return "Đã kết thúc";
  }

  return "Đã hủy";
}

function statusBadgeClass(status: AuctionApiStatus): string {
  if (status === "LIVE") {
    return "bg-theme-brand text-theme-brand-foreground";
  }

  if (status === "DRAFT") {
    return "border border-theme-line theme-muted";
  }

  if (status === "ENDED") {
    return "border border-theme-line text-theme-body";
  }

  return "border border-theme-line theme-muted";
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Chưa thiết lập";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Không hợp lệ";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function toLocalDateTimeInput(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const local = new Date(date.getTime() - timezoneOffset);
  return local.toISOString().slice(0, 16);
}

function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "0 VND";
  }

  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function toEditFormState(data: {
  title: string;
  description: string | null;
  startingPrice: string | number;
  buyNowPrice: string | number | null;
  minBidIncrement: string | number;
  startAt?: string | null;
  endAt: string;
  thumbnailUrl: string | null;
  category: { id: string };
}): EditFormState {
  return {
    title: data.title,
    description: data.description ?? "",
    startingPrice: String(data.startingPrice ?? ""),
    buyNowPrice:
      data.buyNowPrice === null || data.buyNowPrice === undefined
        ? ""
        : String(data.buyNowPrice),
    minBidIncrement: String(data.minBidIncrement ?? ""),
    startAt: toLocalDateTimeInput(data.startAt ?? null),
    endAt: toLocalDateTimeInput(data.endAt),
    thumbnailUrl: data.thumbnailUrl ?? "",
    categoryId: data.category.id,
  };
}

function isHttpUrl(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "cancel" | "delete" | null
  >(null);
  const [activeAction, setActiveAction] = useState<
    "publish" | "cancel" | "delete" | "edit" | null
  >(null);

  const auction = auctionQuery.data;

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
      await Promise.all([
        auctionQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
      ]);
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
      await Promise.all([
        auctionQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
      ]);
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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
      ]);
      setToastMessage("Xóa phiên đấu giá thành công.");
      window.setTimeout(() => {
        router.replace("/seller/auctions");
      }, 900);
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
      await Promise.all([
        auctionQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
      ]);
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

  const thumbnailUrl = auction.thumbnailUrl?.trim() ?? "";
  const canPreviewThumbnail = isHttpUrl(thumbnailUrl);
  const canEdit = auction.status === "DRAFT";

  return (
    <>
      {toastMessage ? (
        <div className="fixed right-4 top-4 z-120 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg">
          {toastMessage}
        </div>
      ) : null}

      <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
              Chi tiết phiên đấu giá
            </p>
            <h1 className="mt-2 wrap-break-word text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
              {auction.title}
            </h1>
            <p className="mt-1 text-xs theme-muted sm:text-sm">
              Mã phiên:{" "}
              <span className="font-semibold theme-heading">
                {auction.code}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex h-8 min-w-30 items-center justify-center rounded-full px-3 py-1 text-center text-xs font-semibold tracking-[0.22em] uppercase ${statusBadgeClass(
                auction.status,
              )}`}
            >
              {statusLabel(auction.status)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Danh mục
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {auction.category.label}
            </p>
          </article>

          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Giá khởi điểm
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {formatCurrency(auction.startingPrice)}
            </p>
          </article>

          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Giá mua ngay
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {formatCurrency(auction.buyNowPrice)}
            </p>
          </article>

          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Bước giá tối thiểu
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {formatCurrency(auction.minBidIncrement)}
            </p>
          </article>

          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Thời gian kết thúc
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {formatDateTime(auction.endAt)}
            </p>
          </article>

          <article className="rounded-2xl border border-theme-line p-4">
            <p className="text-xs uppercase tracking-[0.18em] theme-muted">
              Tổng lượt đặt giá
            </p>
            <p className="mt-2 font-semibold theme-heading">
              {auction._count.bids}
            </p>
          </article>
        </div>

        <article className="mt-4 rounded-2xl border border-theme-line p-4">
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Mô tả
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 theme-body">
            {auction.description?.trim() ||
              "Chưa có mô tả cho phiên đấu giá này."}
          </p>
        </article>

        {canPreviewThumbnail ? (
          <article className="mt-4 overflow-hidden rounded-2xl border border-theme-line bg-(--primary-soft)">
            <img
              src={thumbnailUrl}
              alt={`Ảnh đại diện ${auction.title}`}
              className="h-52 w-full object-cover sm:h-64"
            />
          </article>
        ) : null}

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
                : "Xuất bản phiên"}
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

      {confirmAction ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
          onClick={() => {
            if (activeAction !== null) {
              return;
            }
            setConfirmAction(null);
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
                    void handleCancel();
                    return;
                  }
                  void handleDelete();
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
                onClick={() => {
                  setConfirmAction(null);
                }}
                className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isEditOpen && editForm ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditPopup}
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
                onClick={closeEditPopup}
                className="cursor-pointer rounded-full border border-theme-line px-3 py-1.5 text-xs font-semibold theme-muted transition hover:bg-(--primary-soft)"
              >
                Đóng
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleEditSubmit}>
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
                    disabled={
                      categoriesQuery.isLoading || categoriesQuery.isError
                    }
                    className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">Chọn danh mục</option>
                    {(categoriesQuery.data ?? []).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
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

              {categoriesQuery.isError ? (
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
                  onClick={closeEditPopup}
                  disabled={activeAction === "edit"}
                  className="theme-button-secondary inline-flex cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
