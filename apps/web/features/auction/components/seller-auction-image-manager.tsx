import { ChangeEvent, DragEvent } from "react";

import type { AuctionApiItem } from "@/features/auction/types/auction-api";
import type { SellerAuctionImageAction } from "@/features/auction/types/seller-auction-detail";

type SellerAuctionImageManagerProps = {
  auctionTitle: string;
  thumbnailUrl: string | null;
  images: AuctionApiItem["images"];
  activeImageAction: SellerAuctionImageAction;
  activeImageId: string | null;
  onImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSetPrimaryImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onDropImage: (targetImageId: string) => void;
  onDragImageStart: (imageId: string) => void;
  onDragImageEnd: () => void;
};

export function SellerAuctionImageManager({
  auctionTitle,
  thumbnailUrl,
  images,
  activeImageAction,
  activeImageId,
  onImageUpload,
  onSetPrimaryImage,
  onDeleteImage,
  onDropImage,
  onDragImageStart,
  onDragImageEnd,
}: SellerAuctionImageManagerProps) {
  return (
    <section className="mt-4 rounded-2xl border border-theme-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] theme-muted">
            Quản lý hình ảnh
          </p>
          <p className="mt-1 text-sm theme-muted">
            Upload nhiều ảnh, kéo thả để đổi thứ tự, đặt ảnh chính và xóa ảnh.
          </p>
        </div>

        <label className="theme-button-primary inline-flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-semibold transition">
          {activeImageAction === "upload" ? "Đang upload..." : "Tải ảnh lên"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={activeImageAction !== null}
            onChange={onImageUpload}
            className="sr-only"
          />
        </label>
      </div>

      {images.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => {
            const isImageBusy =
              activeImageId === image.id && activeImageAction !== null;
            const isThumbnailImage =
              Boolean(thumbnailUrl) && image.imageUrl === thumbnailUrl;

            return (
              <article
                key={image.id}
                draggable={activeImageAction === null}
                onDragStart={(event: DragEvent<HTMLElement>) => {
                  onDragImageStart(image.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(event: DragEvent<HTMLElement>) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event: DragEvent<HTMLElement>) => {
                  event.preventDefault();
                  onDropImage(image.id);
                }}
                onDragEnd={onDragImageEnd}
                className="rounded-2xl border border-theme-line bg-(--primary-soft)/35 p-3"
              >
                <div className="relative h-36 overflow-hidden rounded-xl border border-theme-line">
                  <img
                    src={image.imageUrl}
                    alt={image.altText ?? `${auctionTitle} - ảnh ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-theme-line px-2.5 py-1 theme-muted">
                    Thứ tự: {image.sortOrder}
                  </span>
                  {isThumbnailImage ? (
                    <span className="rounded-full border border-theme-line px-2.5 py-1 theme-muted">
                      Thumbnail
                    </span>
                  ) : null}
                  {image.isPrimary ? (
                    <span className="rounded-full bg-theme-brand px-2.5 py-1 text-theme-brand-foreground">
                      Ảnh chính
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={image.isPrimary || activeImageAction !== null}
                    onClick={() => {
                      onSetPrimaryImage(image.id);
                    }}
                    className="theme-button-secondary inline-flex cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isImageBusy && activeImageAction === "set-primary"
                      ? "Đang đặt..."
                      : image.isPrimary
                        ? "Đang là ảnh chính"
                        : "Đặt làm ảnh chính"}
                  </button>

                  <button
                    type="button"
                    disabled={activeImageAction !== null}
                    onClick={() => {
                      onDeleteImage(image.id);
                    }}
                    className="inline-flex cursor-pointer rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isImageBusy && activeImageAction === "delete"
                      ? "Đang xóa..."
                      : "Xóa ảnh"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-theme-line bg-(--primary-soft)/30 px-4 py-3 text-sm theme-muted">
          Chưa có ảnh nào. Hãy tải lên ảnh đầu tiên cho phiên đấu giá.
        </p>
      )}
    </section>
  );
}
