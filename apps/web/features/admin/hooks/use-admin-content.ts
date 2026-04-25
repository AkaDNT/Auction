/**
 * Admin Content Hook (Features & FAQs)
 * SOLID: Single Responsibility - manages content data with React Query
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listAdminFeatures,
  createAdminFeature,
  updateAdminFeature,
  deleteAdminFeature,
  listAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
} from "@/features/admin/services";
import type {
  AdminContentListRequest,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  CreateFaqRequest,
  UpdateFaqRequest,
} from "@/features/admin/types";

const FEATURE_QUERY_KEY = ["admin", "features"];
const FAQ_QUERY_KEY = ["admin", "faqs"];

// ============================================================================
// Features Hooks
// ============================================================================

export function useAdminFeatures(request: AdminContentListRequest = {}) {
  return useQuery({
    queryKey: [...FEATURE_QUERY_KEY, request],
    queryFn: () => listAdminFeatures(request),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFeatureRequest) => createAdminFeature(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEATURE_QUERY_KEY,
      });
    },
  });
}

export function useUpdateAdminFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      featureId,
      request,
    }: {
      featureId: string;
      request: UpdateFeatureRequest;
    }) => updateAdminFeature(featureId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEATURE_QUERY_KEY,
      });
    },
  });
}

export function useDeleteAdminFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (featureId: string) => deleteAdminFeature(featureId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEATURE_QUERY_KEY,
      });
    },
  });
}

// ============================================================================
// FAQs Hooks
// ============================================================================

export function useAdminFaqs(request: AdminContentListRequest = {}) {
  return useQuery({
    queryKey: [...FAQ_QUERY_KEY, request],
    queryFn: () => listAdminFaqs(request),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdminFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFaqRequest) => createAdminFaq(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FAQ_QUERY_KEY,
      });
    },
  });
}

export function useUpdateAdminFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      faqId,
      request,
    }: {
      faqId: string;
      request: UpdateFaqRequest;
    }) => updateAdminFaq(faqId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FAQ_QUERY_KEY,
      });
    },
  });
}

export function useDeleteAdminFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faqId: string) => deleteAdminFaq(faqId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FAQ_QUERY_KEY,
      });
    },
  });
}
