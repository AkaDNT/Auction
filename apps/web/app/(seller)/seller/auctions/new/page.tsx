"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import {
  createSellerAuction,
  type CreateSellerAuctionPayload,
} from "@/features/auction/services/create-seller-auction";
import {
  uploadAuctionThumbnail,
  type UploadedAuctionThumbnail,
} from "@/features/auction/services/upload-auction-thumbnail";
import { getVietnameseCategoryLabel } from "@/features/auction/utils/category-label";

type NewAuctionFormState = {
  title: string;
  description: string;
  startingPrice: string;
  buyNowPrice: string;
  minBidIncrement: string;
  startAt: string;
  endAt: string;
  categoryId: string;
};

const defaultForm: NewAuctionFormState = {
  title: "",
  description: "",
  startingPrice: "",
  buyNowPrice: "",
  minBidIncrement: "",
  startAt: "",
  endAt: "",
  categoryId: "",
};

function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
}

function toOptionalNumber(value: string): number | undefined {
  const normalized = value.replace(/\./g, "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed;
}

function formatThousands(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function SellerNewAuctionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoriesQuery = useAuctionCategories();

  const [form, setForm] = useState<NewAuctionFormState>(defaultForm);
  const [uploadedThumbnail, setUploadedThumbnail] =
    useState<UploadedAuctionThumbnail | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposingStartingPrice, setIsComposingStartingPrice] =
    useState(false);
  const [isComposingBuyNowPrice, setIsComposingBuyNowPrice] = useState(false);
  const [isComposingMinBidIncrement, setIsComposingMinBidIncrement] =
    useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.startingPrice.trim().length > 0 &&
      form.endAt.trim().length > 0 &&
      form.categoryId.trim().length > 0 &&
      !isUploadingThumbnail &&
      !isSubmitting
    );
  }, [form, isSubmitting, isUploadingThumbnail]);

  function updatePriceInput(
    field: keyof Pick<
      NewAuctionFormState,
      "startingPrice" | "buyNowPrice" | "minBidIncrement"
    >,
    value: string,
    isComposing: boolean,
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: isComposing ? value : formatThousands(value),
    }));
  }

  const handleThumbnailChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setThumbnailUploadError("Vui lòng chọn file ảnh hợp lệ.");
      event.target.value = "";
      return;
    }

    setThumbnailUploadError(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsUploadingThumbnail(true);

    try {
      const uploaded = await uploadAuctionThumbnail(file);
      setUploadedThumbnail(uploaded);
    } catch (error) {
      const fallback = "Không thể upload ảnh thumbnail. Vui lòng thử lại.";
      setThumbnailUploadError(
        error instanceof Error ? error.message : fallback,
      );
      setUploadedThumbnail(null);
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const clearThumbnail = () => {
    setUploadedThumbnail(null);
    setThumbnailUploadError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const startingPrice = Number(form.startingPrice.replace(/\./g, ""));
    const buyNowPrice = toOptionalNumber(form.buyNowPrice);
    const minBidIncrement = toOptionalNumber(form.minBidIncrement);
    const startAt = form.startAt ? toIsoDateTime(form.startAt) : undefined;
    const endAt = toIsoDateTime(form.endAt);

    if (!title) {
      setErrorMessage("Vui lòng nhập tiêu đề phiên đấu giá.");
      setSuccessMessage(null);
      return;
    }

    if (!form.categoryId) {
      setErrorMessage("Vui lòng chọn danh mục đấu giá.");
      setSuccessMessage(null);
      return;
    }

    if (!Number.isFinite(startingPrice) || startingPrice < 0) {
      setErrorMessage("Giá khởi điểm phải là số lớn hơn hoặc bằng 0.");
      setSuccessMessage(null);
      return;
    }

    if (!form.endAt || Number.isNaN(new Date(form.endAt).getTime())) {
      setErrorMessage("Vui lòng chọn thời gian kết thúc hợp lệ.");
      setSuccessMessage(null);
      return;
    }

    if (startAt && new Date(startAt).getTime() >= new Date(endAt).getTime()) {
      setErrorMessage("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.");
      setSuccessMessage(null);
      return;
    }

    if (buyNowPrice !== undefined && buyNowPrice < 0) {
      setErrorMessage("Giá mua ngay phải là số lớn hơn hoặc bằng 0.");
      setSuccessMessage(null);
      return;
    }

    if (buyNowPrice !== undefined && buyNowPrice <= startingPrice) {
      setErrorMessage("Giá mua ngay phải lớn hơn giá khởi điểm.");
      setSuccessMessage(null);
      return;
    }

    if (minBidIncrement !== undefined && minBidIncrement < 1001) {
      setErrorMessage("Bước giá tối thiểu phải lớn hơn hoặc bằng 1001.");
      setSuccessMessage(null);
      return;
    }

    const payload: CreateSellerAuctionPayload = {
      title,
      description: form.description.trim() || undefined,
      startingPrice,
      buyNowPrice,
      minBidIncrement,
      startAt,
      endAt,
      thumbnailUrl: uploadedThumbnail?.assetId,
      categoryId: form.categoryId,
    };

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdAuction = await createSellerAuction(payload);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["seller-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["seller-auctions-page"] }),
      ]);

      setSuccessMessage("Tạo phiên đấu giá thành công. Đang chuyển hướng...");
      setForm(defaultForm);
      setUploadedThumbnail(null);
      router.replace(
        `/seller/auctions/${encodeURIComponent(createdAuction.id)}`,
      );
    } catch (error) {
      const fallback = "Không thể tạo phiên đấu giá. Vui lòng thử lại.";
      setErrorMessage(error instanceof Error ? error.message : fallback);
      setSuccessMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="theme-surface rounded-2xl p-3 sm:rounded-3xl sm:p-4 md:rounded-3xl md:p-5 lg:rounded-4xl lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] theme-primary sm:text-sm">
            Phiên đấu giá mới
          </p>
          <h1 className="mt-2 text-lg font-semibold theme-heading sm:text-2xl md:text-3xl">
            Tạo phiên đấu giá người bán
          </h1>
          <p className="mt-1 text-xs theme-muted sm:text-sm">
            Điền thông tin cơ bản để lưu phiên dưới dạng nháp trước khi phát
            hành.
          </p>
        </div>
        <Link
          href="/seller/auctions"
          className="theme-button-secondary inline-flex rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm"
        >
          Quay lại danh sách
        </Link>
      </div>

      <form className="mt-5 space-y-5 sm:mt-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Tiêu đề phiên đấu giá
            </span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
              maxLength={255}
              placeholder="Ví dụ: Đồng hồ cổ Thụy Sĩ"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Mô tả (không bắt buộc)
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
              rows={4}
              maxLength={4000}
              placeholder="Mô tả chi tiết tình trạng sản phẩm, giấy tờ đi kèm..."
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Danh mục
            </span>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, categoryId: event.target.value }))
              }
              required
              disabled={categoriesQuery.isLoading || categoriesQuery.isError}
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Chọn danh mục</option>
              {(categoriesQuery.data ?? []).map((category) => (
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
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={form.startingPrice}
              onChange={(event) =>
                updatePriceInput(
                  "startingPrice",
                  event.target.value,
                  isComposingStartingPrice,
                )
              }
              onCompositionStart={() => setIsComposingStartingPrice(true)}
              onCompositionEnd={(event) => {
                setIsComposingStartingPrice(false);
                updatePriceInput(
                  "startingPrice",
                  event.currentTarget.value,
                  false,
                );
              }}
              required
              placeholder="Bội số của 1.000. Ví dụ: 1.500.000"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Giá mua ngay (không bắt buộc)
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={form.buyNowPrice}
              onChange={(event) =>
                updatePriceInput(
                  "buyNowPrice",
                  event.target.value,
                  isComposingBuyNowPrice,
                )
              }
              onCompositionStart={() => setIsComposingBuyNowPrice(true)}
              onCompositionEnd={(event) => {
                setIsComposingBuyNowPrice(false);
                updatePriceInput(
                  "buyNowPrice",
                  event.currentTarget.value,
                  false,
                );
              }}
              placeholder="Bội số của 1.000. Ví dụ: 4.500.000"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Bước giá tối thiểu (không bắt buộc)
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9.]*"
              value={form.minBidIncrement}
              onChange={(event) =>
                updatePriceInput(
                  "minBidIncrement",
                  event.target.value,
                  isComposingMinBidIncrement,
                )
              }
              onCompositionStart={() => setIsComposingMinBidIncrement(true)}
              onCompositionEnd={(event) => {
                setIsComposingMinBidIncrement(false);
                updatePriceInput(
                  "minBidIncrement",
                  event.currentTarget.value,
                  false,
                );
              }}
              placeholder="Tối thiểu 5.000"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Bắt đầu lúc (không bắt buộc)
            </span>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startAt: event.target.value }))
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
              value={form.endAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endAt: event.target.value }))
              }
              required
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Ảnh đại diện (không bắt buộc)
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              disabled={isUploadingThumbnail || isSubmitting}
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />

            {isUploadingThumbnail ? (
              <p className="mt-2 text-xs theme-primary">
                Đang upload thumbnail...
              </p>
            ) : null}

            {uploadedThumbnail ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-theme-line px-2.5 py-1 theme-muted">
                  assetId: {uploadedThumbnail.assetId}
                </span>
                <button
                  type="button"
                  onClick={clearThumbnail}
                  className="theme-button-secondary inline-flex rounded-full px-3 py-1 font-semibold"
                >
                  Gỡ ảnh
                </button>
              </div>
            ) : null}

            {thumbnailUploadError ? (
              <p className="mt-2 text-xs text-red-600">
                {thumbnailUploadError}
              </p>
            ) : null}
          </label>

          {uploadedThumbnail ? (
            <div className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Xem trước ảnh đại diện
              </span>
              <div className="overflow-hidden rounded-2xl border border-theme-line bg-(--primary-soft)">
                <img
                  src={uploadedThumbnail.fileUrl}
                  alt="Xem trước ảnh đại diện phiên đấu giá"
                  className="h-52 w-full object-cover sm:h-64"
                />
              </div>
            </div>
          ) : null}
        </div>

        {categoriesQuery.isError ? (
          <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            Không thể tải danh mục đấu giá. Vui lòng thử lại sau.
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="theme-button-primary inline-flex min-w-45 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang tạo phiên..." : "Lưu phiên đấu giá"}
          </button>
          <Link
            href="/seller/auctions"
            className="theme-button-secondary inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition"
          >
            Hủy
          </Link>
        </div>
      </form>
    </section>
  );
}
