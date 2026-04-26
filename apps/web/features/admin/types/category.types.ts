/**
 * Admin Category Types
 * SOLID: Separated from other domain types
 */

export interface AdminCategory {
  id: string;
  slug: string;
  label: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  slug: string;
  label: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  slug?: string;
  label?: string;
  description?: string;
}

export interface AdminCategoryListRequest {
  search?: string;
}
