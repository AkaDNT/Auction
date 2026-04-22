"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAuctionCategories } from "@/features/auction/hooks/use-auction-categories";
import {
  createSellerAuction,
  type CreateSellerAuctionPayload,
} from "@/features/auction/services/create-seller-auction";

type NewAuctionFormState = {
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

const defaultForm: NewAuctionFormState = {
  title: "",
  description: "",
  startingPrice: "",
  buyNowPrice: "",
  minBidIncrement: "",
  startAt: "",
  endAt: "",
  thumbnailUrl: "",
  categoryId: "",
};

function toIsoDateTime(localDateTime: string): string {
  return new Date(localDateTime).toISOString();
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

export default function SellerNewAuctionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const categoriesQuery = useAuctionCategories();

  const [form, setForm] = useState<NewAuctionFormState>(defaultForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const thumbnailUrl = form.thumbnailUrl.trim();
  const hasValidThumbnail = isHttpUrl(thumbnailUrl);

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.startingPrice.trim().length > 0 &&
      form.endAt.trim().length > 0 &&
      form.categoryId.trim().length > 0 &&
      !isSubmitting
    );
  }, [form, isSubmitting]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const startingPrice = Number(form.startingPrice);
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
      thumbnailUrl: form.thumbnailUrl.trim() || undefined,
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
              value={form.startingPrice}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  startingPrice: event.target.value,
                }))
              }
              required
              placeholder="Ví dụ: 1500000"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Giá mua ngay (không bắt buộc)
            </span>
            <input
              type="number"
              min={0}
              step="1000"
              value={form.buyNowPrice}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  buyNowPrice: event.target.value,
                }))
              }
              placeholder="Ví dụ: 4500000"
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
              Bước giá tối thiểu (không bắt buộc)
            </span>
            <input
              type="number"
              min={1001}
              step="1"
              value={form.minBidIncrement}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minBidIncrement: event.target.value,
                }))
              }
              placeholder="Tối thiểu 1001"
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
              Ảnh đại diện URL (không bắt buộc)
            </span>
            <input
              type="url"
              value={form.thumbnailUrl}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  thumbnailUrl: event.target.value,
                }))
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-theme-line bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-(--border)"
            />
            {thumbnailUrl && !hasValidThumbnail ? (
              <p className="mt-2 text-xs text-red-600">
                URL ảnh chưa hợp lệ. Vui lòng nhập link bắt đầu bằng http://
                hoặc https://
              </p>
            ) : null}
          </label>

          {hasValidThumbnail ? (
            <div className="block md:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] theme-muted">
                Xem trước ảnh đại diện
              </span>
              <div className="overflow-hidden rounded-2xl border border-theme-line bg-(--primary-soft)">
                <img
                  src={thumbnailUrl}
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
