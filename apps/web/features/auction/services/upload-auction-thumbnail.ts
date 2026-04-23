import { authHttpFetch } from "@/features/auth/services/auth-http.client";

const THUMBNAIL_SCOPE = "AUCTION_THUMBNAIL" as const;

type UploadUrlResponse = {
  storageKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
};

type ConfirmUploadResponse = {
  id: string;
  ownerId: string;
  storageKey: string;
  fileUrl: string;
  fileName: string;
  contentType: string;
  scope: typeof THUMBNAIL_SCOPE;
  status: "READY" | string;
  expiresAt: string;
};

export type UploadedAuctionThumbnail = {
  assetId: string;
  fileUrl: string;
  storageKey: string;
};

function resolveContentType(file: File): string {
  return file.type || "application/octet-stream";
}

export async function uploadAuctionThumbnail(
  file: File,
): Promise<UploadedAuctionThumbnail> {
  const contentType = resolveContentType(file);

  const uploadUrlResponse = await authHttpFetch("/seller/uploads/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      scope: THUMBNAIL_SCOPE,
    }),
  });

  if (!uploadUrlResponse.ok) {
    throw new Error("Không thể lấy đường dẫn upload thumbnail.");
  }

  const uploadUrlData = (await uploadUrlResponse.json()) as UploadUrlResponse;

  const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload thumbnail thất bại. Vui lòng thử lại.");
  }

  const confirmResponse = await authHttpFetch("/seller/uploads/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storageKey: uploadUrlData.storageKey,
      scope: THUMBNAIL_SCOPE,
    }),
  });

  if (!confirmResponse.ok) {
    throw new Error("Không thể xác nhận upload thumbnail.");
  }

  const asset = (await confirmResponse.json()) as ConfirmUploadResponse;

  return {
    assetId: asset.id,
    fileUrl: asset.fileUrl,
    storageKey: asset.storageKey,
  };
}
