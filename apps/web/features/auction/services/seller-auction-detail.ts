import { authHttpFetch } from "@/features/auth/services/auth-http.client";
import type { AuctionApiItem } from "@/features/auction/types/auction-api";

type SellerAuctionImage = AuctionApiItem["images"][number];

export type UpdateSellerAuctionPayload = {
  title?: string;
  description?: string;
  startingPrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startAt?: string;
  endAt?: string;
  thumbnailUrl?: string;
  categoryId?: string;
};

type ApiErrorPayload = {
  error?: {
    message?: string;
  };
  message?: string;
};

type SellerAuctionImageUploadUrlPayload = {
  fileName: string;
  contentType: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

type SellerAuctionImageUploadUrlResponse = {
  storageKey: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
};

type SellerAuctionImageConfirmPayload = {
  storageKey: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

async function toErrorMessage(response: Response, fallback: string) {
  const data = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null;
  return data?.error?.message ?? data?.message ?? fallback;
}

export async function getSellerAuctionById(
  id: string,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}`);

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(
        response,
        "Không thể tải thông tin phiên đấu giá của người bán.",
      ),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function updateSellerAuction(
  id: string,
  payload: UpdateSellerAuctionPayload,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể cập nhật phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function publishSellerAuction(
  id: string,
): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}/publish`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể phát hành phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function cancelSellerAuction(id: string): Promise<AuctionApiItem> {
  const response = await authHttpFetch(`/seller/auctions/${id}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể hủy phiên đấu giá."),
    );
  }

  return (await response.json()) as AuctionApiItem;
}

export async function deleteSellerAuction(id: string): Promise<void> {
  const response = await authHttpFetch(`/seller/auctions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể xóa phiên đấu giá."),
    );
  }
}

export async function createSellerAuctionImageUploadUrl(
  auctionId: string,
  payload: SellerAuctionImageUploadUrlPayload,
): Promise<SellerAuctionImageUploadUrlResponse> {
  const response = await authHttpFetch(
    `/seller/auctions/${auctionId}/images/upload-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể lấy đường dẫn upload ảnh."),
    );
  }

  return (await response.json()) as SellerAuctionImageUploadUrlResponse;
}

export async function confirmSellerAuctionImageUpload(
  auctionId: string,
  payload: SellerAuctionImageConfirmPayload,
): Promise<SellerAuctionImage> {
  const response = await authHttpFetch(
    `/seller/auctions/${auctionId}/images/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      await toErrorMessage(response, "Không thể xác nhận ảnh upload."),
    );
  }

  return (await response.json()) as SellerAuctionImage;
}

export async function uploadSellerAuctionImageToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Upload ảnh lên lưu trữ thất bại.");
  }
}

export async function updateSellerAuctionImage(
  imageId: string,
  payload: {
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
  },
): Promise<SellerAuctionImage> {
  const response = await authHttpFetch(`/seller/auction-images/${imageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Không thể cập nhật ảnh."));
  }

  return (await response.json()) as SellerAuctionImage;
}

export async function setPrimarySellerAuctionImage(
  imageId: string,
): Promise<SellerAuctionImage> {
  const response = await authHttpFetch(
    `/seller/auction-images/${imageId}/set-primary`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Không thể đặt ảnh chính."));
  }

  return (await response.json()) as SellerAuctionImage;
}

export async function deleteSellerAuctionImage(imageId: string): Promise<void> {
  const response = await authHttpFetch(`/seller/auction-images/${imageId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await toErrorMessage(response, "Không thể xóa ảnh."));
  }
}
