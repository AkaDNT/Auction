/**
 * Admin Category Service
 * SOLID: Single Responsibility - manages category API calls
 * Dependency: API client, types
 */

import type {
  AdminCategory,
  AdminCategoryListRequest,
  AdminCategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/features/admin/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function listAdminCategories(
  request: AdminCategoryListRequest = {},
): Promise<AdminCategoryListResponse> {
  const params = new URLSearchParams();

  if (request.page) params.append("page", String(request.page));
  if (request.limit) params.append("limit", String(request.limit));
  if (request.isActive !== undefined)
    params.append("isActive", String(request.isActive));
  if (request.sortBy) params.append("sortBy", request.sortBy);
  if (request.sortOrder) params.append("sortOrder", request.sortOrder);
  if (request.search) params.append("search", request.search);

  const response = await fetch(
    `${API_BASE}/admin/auction-categories?${params}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

export async function getAdminCategoryById(
  categoryId: string,
): Promise<AdminCategory> {
  const response = await fetch(
    `${API_BASE}/admin/auction-categories/${categoryId}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch category");
  }

  return response.json();
}

export async function createAdminCategory(
  request: CreateCategoryRequest,
): Promise<AdminCategory> {
  const response = await fetch(`${API_BASE}/admin/auction-categories`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json();
}

export async function updateAdminCategory(
  categoryId: string,
  request: UpdateCategoryRequest,
): Promise<AdminCategory> {
  const response = await fetch(
    `${API_BASE}/admin/auction-categories/${categoryId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update category");
  }

  return response.json();
}

export async function deleteAdminCategory(categoryId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/admin/auction-categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
}
