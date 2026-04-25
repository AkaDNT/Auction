/**
 * Admin Content Types (Features & FAQs)
 * SOLID: Separated from other domain types
 */

export interface AdminAuctionFeature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
  icon?: string;
  displayOrder: number;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AdminAuctionFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  isActive: boolean;
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
}

export interface UpdateFaqRequest {
  question?: string;
  answer?: string;
  category?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface AdminContentListRequest {
  page?: number;
  limit?: number;
  isActive?: boolean;
  sortBy?: "createdAt" | "displayOrder" | "views";
  sortOrder?: "ASC" | "DESC";
  search?: string;
  category?: string;
}

export interface AdminContentListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
