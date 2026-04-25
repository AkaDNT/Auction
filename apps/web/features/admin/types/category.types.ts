/**
 * Admin Category Types
 * SOLID: Separated from other domain types
 */

export interface AdminCategory {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  auctionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  displayOrder: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AdminCategoryListRequest {
  page?: number;
  limit?: number;
  isActive?: boolean;
  sortBy?: "createdAt" | "displayOrder" | "auctionCount";
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

export interface AdminCategoryListResponse {
  data: AdminCategory[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
