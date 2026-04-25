/**
 * Admin Categories Hook
 * SOLID: Single Responsibility - manages category data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminCategories,
  getAdminCategoryById,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "@/features/admin/services";
import type {
  AdminCategoryListRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/features/admin/types";

const CATEGORY_QUERY_KEY = ["admin", "categories"];
const CATEGORY_DETAIL_QUERY_KEY = ["admin", "category-detail"];

export function useAdminCategories(request: AdminCategoryListRequest = {}) {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, request],
    queryFn: () => listAdminCategories(request),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminCategoryById(categoryId: string) {
  return useQuery({
    queryKey: [...CATEGORY_DETAIL_QUERY_KEY, categoryId],
    queryFn: () => getAdminCategoryById(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCategoryRequest) =>
      createAdminCategory(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
    },
  });
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      request,
    }: {
      categoryId: string;
      request: UpdateCategoryRequest;
    }) => updateAdminCategory(categoryId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
      queryClient.invalidateQueries({
        queryKey: [...CATEGORY_DETAIL_QUERY_KEY, variables.categoryId],
      });
    },
  });
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteAdminCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CATEGORY_QUERY_KEY,
      });
    },
  });
}
