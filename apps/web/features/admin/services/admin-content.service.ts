/**
 * Admin Content Service (Features & FAQs)
 * SOLID: Single Responsibility - manages content API calls
 * Dependency: API client, types
 */

import type {
  AdminAuctionFeature,
  AdminAuctionFaq,
  AdminContentListRequest,
  AdminContentListResponse,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  CreateFaqRequest,
  UpdateFaqRequest,
} from "@/features/admin/types";
import { authHttpFetch } from "@/features/auth/services/auth-http.client";

// ============================================================================
// Features Service
// ============================================================================

export async function listAdminFeatures(
  request: AdminContentListRequest = {},
): Promise<AdminContentListResponse<AdminAuctionFeature>> {
  const params = new URLSearchParams();

  if (request.page) params.append("page", String(request.page));
  if (request.limit) params.append("limit", String(request.limit));
  if (request.isActive !== undefined)
    params.append("isActive", String(request.isActive));
  if (request.sortBy) params.append("sortBy", request.sortBy);
  if (request.sortOrder) params.append("sortOrder", request.sortOrder);
  if (request.search) params.append("search", request.search);

  const response = await authHttpFetch(`/admin/auction-features?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch features");
  }

  return response.json();
}

export async function getAdminFeatureById(
  featureId: string,
): Promise<AdminAuctionFeature> {
  const response = await authHttpFetch(
    `/admin/auction-features/${featureId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch feature");
  }

  return response.json();
}

export async function createAdminFeature(
  request: CreateFeatureRequest,
): Promise<AdminAuctionFeature> {
  const response = await authHttpFetch("/admin/auction-features", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create feature");
  }

  return response.json();
}

export async function updateAdminFeature(
  featureId: string,
  request: UpdateFeatureRequest,
): Promise<AdminAuctionFeature> {
  const response = await authHttpFetch(
    `/admin/auction-features/${featureId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update feature");
  }

  return response.json();
}

export async function deleteAdminFeature(featureId: string): Promise<void> {
  const response = await authHttpFetch(
    `/admin/auction-features/${featureId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete feature");
  }
}

// ============================================================================
// FAQs Service
// ============================================================================

export async function listAdminFaqs(
  request: AdminContentListRequest = {},
): Promise<AdminContentListResponse<AdminAuctionFaq>> {
  const params = new URLSearchParams();

  if (request.page) params.append("page", String(request.page));
  if (request.limit) params.append("limit", String(request.limit));
  if (request.isActive !== undefined)
    params.append("isActive", String(request.isActive));
  if (request.category) params.append("category", request.category);
  if (request.sortBy) params.append("sortBy", request.sortBy);
  if (request.sortOrder) params.append("sortOrder", request.sortOrder);
  if (request.search) params.append("search", request.search);

  const response = await authHttpFetch(`/admin/auction-faqs?${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch FAQs");
  }

  return response.json();
}

export async function getAdminFaqById(faqId: string): Promise<AdminAuctionFaq> {
  const response = await authHttpFetch(`/admin/auction-faqs/${faqId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch FAQ");
  }

  return response.json();
}

export async function createAdminFaq(
  request: CreateFaqRequest,
): Promise<AdminAuctionFaq> {
  const response = await authHttpFetch("/admin/auction-faqs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create FAQ");
  }

  return response.json();
}

export async function updateAdminFaq(
  faqId: string,
  request: UpdateFaqRequest,
): Promise<AdminAuctionFaq> {
  const response = await authHttpFetch(`/admin/auction-faqs/${faqId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to update FAQ");
  }

  return response.json();
}

export async function deleteAdminFaq(faqId: string): Promise<void> {
  const response = await authHttpFetch(`/admin/auction-faqs/${faqId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete FAQ");
  }
}
