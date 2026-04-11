"use client";

import { useQuery } from "@tanstack/react-query";
import { listAuctionCategories } from "@/features/auction/services/list-auctions";

export function useAuctionCategories() {
  return useQuery({
    queryKey: ["auction-categories"],
    queryFn: () => listAuctionCategories(),
  });
}
