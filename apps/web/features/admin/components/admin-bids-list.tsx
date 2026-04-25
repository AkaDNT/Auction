/**
 * Admin Bids List Component
 * SOLID: Single Responsibility - displays bids and actions
 * Dependency: hooks, types
 */

"use client";

import { useMemo } from "react";
import {
  useAdminBids,
  useRejectAdminBid,
  useCancelAdminBid,
} from "@/features/admin/hooks";
import type { AdminBidListRequest } from "@/features/admin/types";

interface AdminBidsListProps {
  request?: AdminBidListRequest;
}

export function AdminBidsList({ request = {} }: AdminBidsListProps) {
  const bidsQuery = useAdminBids(request);
  const rejectMutation = useRejectAdminBid();
  const cancelMutation = useCancelAdminBid();

  const bids = useMemo(() => {
    return bidsQuery.data?.data ?? [];
  }, [bidsQuery.data]);

  const handleReject = async (bidId: string) => {
    try {
      await rejectMutation.mutateAsync({
        bidId,
        request: { reason: "Từ chối bởi quản trị viên" },
      });
      alert("Lượt đặt giá đã bị từ chối");
    } catch {
      alert("Lỗi: Không thể từ chối lượt đặt giá");
    }
  };

  const handleCancel = async (bidId: string) => {
    try {
      await cancelMutation.mutateAsync({
        bidId,
        request: { reason: "Hủy bởi quản trị viên" },
      });
      alert("Lượt đặt giá đã bị hủy");
    } catch {
      alert("Lỗi: Không thể hủy lượt đặt giá");
    }
  };

  if (bidsQuery.isLoading) {
    return <div>Đang tải danh sách lượt đặt giá...</div>;
  }

  if (bidsQuery.isError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
        Lỗi: Không thể tải danh sách lượt đặt giá
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="rounded-lg border border-gray-300 p-8 text-center text-gray-600">
        Không có lượt đặt giá nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-4 py-2 text-left font-semibold">Phiên đấu giá</th>
            <th className="px-4 py-2 text-left font-semibold">Người đặt</th>
            <th className="px-4 py-2 text-left font-semibold">Số tiền</th>
            <th className="px-4 py-2 text-left font-semibold">Trạng thái</th>
            <th className="px-4 py-2 text-left font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid) => (
            <tr key={bid.id} className="border-b border-gray-200">
              <td className="px-4 py-2">{bid.auctionTitle}</td>
              <td className="px-4 py-2">{bid.bidderName}</td>
              <td className="px-4 py-2 font-semibold">${bid.amount}</td>
              <td className="px-4 py-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                  {bid.status}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                {bid.status === "ACTIVE" && (
                  <>
                    <button
                      onClick={() => handleReject(bid.id)}
                      disabled={rejectMutation.isPending}
                      className="text-red-600 hover:underline"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleCancel(bid.id)}
                      disabled={cancelMutation.isPending}
                      className="text-yellow-600 hover:underline"
                    >
                      Hủy
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
