"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { auctionHttpFetch } from "@/features/auction/services/auction-http.client";
import {
  AUCTION_WS_EVENTS,
  createAuctionRealtimeSocket,
  type AuctionBidPlacedEvent,
  type AuctionRoomEvent,
} from "@/features/auction/services/auction-realtime.client";
import { authHttpFetch } from "@/features/auth/services/auth-http.client";

type LiveBidHistoryProps = {
  auctionId: string;
  suggestedBidAmount: number;
  minBidIncrement: number;
};

type BidApiItem = {
  id: string;
  bidderId: string;
  amount: string | number;
  createdAt: string;
};

type BidApiResponse = {
  items: BidApiItem[];
  meta?: {
    total: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
    sourceWindow: string;
  };
};

type BidViewModel = {
  key: string;
  bidderLabel: string;
  amountLabel: string;
  amountValue: number;
  timeLabel: string;
  placedAtMs: number;
};

function toBidderLabel(bidderId: string) {
  const tail = bidderId.slice(-6).toUpperCase();
  return `Bidder #${tail}`;
}

function toAmountLabel(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return "0 VND";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(numericValue)} VND`;
}

function toTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }

  return date.toLocaleTimeString("vi-VN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function toBidDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatBidInput(value: string) {
  const digits = toBidDigits(value).replace(/^0+(?=\d)/, "");
  if (!digits) {
    return "";
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseBidInput(value: string) {
  const digits = toBidDigits(value);
  if (!digits) {
    return Number.NaN;
  }

  return Number(digits);
}

function mapBidApiItem(item: BidApiItem): BidViewModel {
  const amountValue = Number(item.amount);

  return {
    key: item.id,
    bidderLabel: toBidderLabel(item.bidderId),
    amountLabel: toAmountLabel(item.amount),
    amountValue: Number.isFinite(amountValue) ? amountValue : 0,
    timeLabel: toTimeLabel(item.createdAt),
    placedAtMs: new Date(item.createdAt).getTime() || 0,
  };
}

function mapBidPlacedEvent(event: AuctionBidPlacedEvent): BidViewModel {
  const amountValue = Number(event.amount);

  return {
    key: `${event.bidderId}-${event.amount}-${event.placedAt}`,
    bidderLabel: toBidderLabel(event.bidderId),
    amountLabel: toAmountLabel(event.amount),
    amountValue: Number.isFinite(amountValue) ? amountValue : 0,
    timeLabel: toTimeLabel(event.placedAt),
    placedAtMs: new Date(event.placedAt).getTime() || Date.now(),
  };
}

function createOptimisticBidViewModel(amount: number): BidViewModel {
  const placedAt = new Date().toISOString();

  return {
    key: `optimistic-${placedAt}-${amount}`,
    bidderLabel: "Bạn",
    amountLabel: toAmountLabel(amount),
    amountValue: amount,
    timeLabel: toTimeLabel(placedAt),
    placedAtMs: new Date(placedAt).getTime() || Date.now(),
  };
}

function sortBidsByAmountAscThenCreatedAtDesc(bids: BidViewModel[]) {
  return [...bids].sort((left, right) => {
    if (left.amountValue !== right.amountValue) {
      return left.amountValue - right.amountValue;
    }

    return right.placedAtMs - left.placedAtMs;
  });
}

export function LiveBidHistory({
  auctionId,
  suggestedBidAmount,
  minBidIncrement,
}: LiveBidHistoryProps) {
  const [bidsDesc, setBidsDesc] = useState<BidViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [realtimeTransport, setRealtimeTransport] = useState<string | null>(
    null,
  );
  const [bidAmountInput, setBidAmountInput] = useState(
    Number.isFinite(suggestedBidAmount)
      ? formatBidInput(String(suggestedBidAmount))
      : "",
  );
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const isNearBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return true;
    }

    const delta =
      container.scrollHeight - container.clientHeight - container.scrollTop;
    return delta < 48;
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  };

  const fetchLatestBidHistory = useCallback(async () => {
    const response = await auctionHttpFetch(
      `/auctions/${encodeURIComponent(auctionId)}/bids/latest-100-by-amount`,
    );

    if (!response.ok) {
      throw new Error("Không thể tải lịch sử đặt giá");
    }

    const json = (await response.json()) as BidApiResponse;
    const mapped = (json.items ?? []).map(mapBidApiItem);

    return sortBidsByAmountAscThenCreatedAtDesc(mapped);
  }, [auctionId]);

  useEffect(() => {
    let mounted = true;

    const loadBids = async () => {
      try {
        const mapped = await fetchLatestBidHistory();

        if (mounted) {
          setBidsDesc(mapped);
        }
      } catch {
        if (mounted) {
          setBidsDesc([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadBids();

    return () => {
      mounted = false;
    };
  }, [fetchLatestBidHistory]);

  useEffect(() => {
    if (!Number.isFinite(suggestedBidAmount)) {
      return;
    }

    setBidAmountInput(formatBidInput(String(suggestedBidAmount)));
  }, [suggestedBidAmount]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    requestAnimationFrame(scrollToBottom);
  }, [isLoading]);

  const placeBid = async () => {
    const parsedAmount = parseBidInput(bidAmountInput);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Vui lòng nhập mức giá hợp lệ.");
      setSubmitMessage(null);
      return;
    }

    setIsSubmittingBid(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await authHttpFetch(
        `/auctions/${encodeURIComponent(auctionId)}/bids`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: parsedAmount }),
        },
      );

      if (!response.ok) {
        let message = "Không thể đặt giá. Vui lòng thử lại.";
        try {
          const json = (await response.json()) as {
            error?: { message?: string };
          };
          message = json.error?.message ?? message;
        } catch {
          message = "Không thể đặt giá. Vui lòng thử lại.";
        }

        throw new Error(message);
      }

      setSubmitMessage("Đã gửi lệnh đặt giá.");

      const optimisticBid = createOptimisticBidViewModel(parsedAmount);
      setBidsDesc((currentBids) => {
        return sortBidsByAmountAscThenCreatedAtDesc([
          ...currentBids,
          optimisticBid,
        ]);
      });
      requestAnimationFrame(scrollToBottom);

      // Fallback fetch to keep UI updated even when websocket delivery is delayed.
      const mapped = await fetchLatestBidHistory();
      setBidsDesc(mapped);
      requestAnimationFrame(scrollToBottom);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Không thể đặt giá. Vui lòng thử lại.",
      );
    } finally {
      setIsSubmittingBid(false);
    }
  };

  useEffect(() => {
    const socket = createAuctionRealtimeSocket();

    socket.on("connect", () => {
      setIsRealtimeConnected(true);
      setIsRoomJoined(false);
      setRealtimeError(null);
      setRealtimeTransport(socket.io.engine.transport.name);
      if (process.env.NODE_ENV !== "production") {
        console.debug("auction realtime connected", {
          auctionId,
          transport: socket.io.engine.transport.name,
        });
      }
      socket.emit(AUCTION_WS_EVENTS.JOIN, { auctionId });
    });

    socket.io.engine.on("upgrade", (transport) => {
      setRealtimeTransport(transport.name);
      if (process.env.NODE_ENV !== "production") {
        console.debug("auction realtime upgraded", {
          auctionId,
          transport: transport.name,
        });
      }
    });

    socket.on("connect_error", (error: Error) => {
      setIsRealtimeConnected(false);
      setIsRoomJoined(false);
      setRealtimeError(error.message || "Không thể kết nối realtime");
    });

    socket.on(AUCTION_WS_EVENTS.JOINED, (event: AuctionRoomEvent) => {
      if (event.auctionId !== auctionId) {
        return;
      }

      setIsRoomJoined(true);
      setRealtimeError(null);
    });

    socket.on("disconnect", () => {
      setIsRealtimeConnected(false);
      setIsRoomJoined(false);
    });

    socket.on(AUCTION_WS_EVENTS.BID_PLACED, (event: AuctionBidPlacedEvent) => {
      if (event.auctionId !== auctionId) {
        return;
      }

      const shouldStickBottom = isNearBottom();
      const incoming = mapBidPlacedEvent(event);
      setBidsDesc((currentBids) => {
        return sortBidsByAmountAscThenCreatedAtDesc([...currentBids, incoming]);
      });

      if (shouldStickBottom) {
        requestAnimationFrame(scrollToBottom);
      }
    });

    return () => {
      socket.emit(AUCTION_WS_EVENTS.LEAVE, { auctionId });
      socket.disconnect();
    };
  }, [auctionId]);

  const headerStatus = useMemo(() => {
    if (realtimeError) {
      return "Realtime lỗi kết nối";
    }

    if (isRealtimeConnected && isRoomJoined) {
      return "Realtime online";
    }

    if (isRealtimeConnected) {
      return "Realtime đang tham gia phòng";
    }

    return "Realtime offline";
  }, [isRealtimeConnected, isRoomJoined, realtimeError]);

  const bidsAsc = useMemo(() => bidsDesc, [bidsDesc]);
  const safeMinBidIncrement = useMemo(() => {
    if (!Number.isFinite(minBidIncrement) || minBidIncrement <= 0) {
      return 1000;
    }

    return minBidIncrement;
  }, [minBidIncrement]);
  const suggestedAmount = useMemo(() => {
    const highestBid = bidsAsc.at(-1)?.amountValue;
    if (Number.isFinite(highestBid) && highestBid > 0) {
      return highestBid + safeMinBidIncrement;
    }

    if (Number.isFinite(suggestedBidAmount) && suggestedBidAmount > 0) {
      return suggestedBidAmount;
    }

    return safeMinBidIncrement;
  }, [bidsAsc, safeMinBidIncrement, suggestedBidAmount]);

  return (
    <aside className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-theme-line bg-theme-panel p-6 shadow-[0_22px_60px_-34px_var(--glow)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--primary-soft),transparent_58%)]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-brand">
            Live Feed
          </p>
          <h2 className="mt-1 text-lg font-semibold text-theme-heading">
            Lịch sử đấu giá
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-theme-line bg-theme-bg px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-theme-muted">
          <span
            className={`h-2 w-2 rounded-full ${
              isRealtimeConnected && isRoomJoined
                ? "bg-emerald-500"
                : "bg-theme-muted"
            }`}
          />
          {headerStatus}
        </span>
      </div>
      {realtimeError ? (
        <p className="relative z-10 mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
          {realtimeError}
        </p>
      ) : null}
      {isLoading ? (
        <p className="relative z-10 mt-4 text-sm text-theme-muted">
          Đang tải lịch sử đặt giá...
        </p>
      ) : bidsAsc.length === 0 ? (
        <p className="relative z-10 mt-4 text-sm text-theme-muted">
          Chưa có lượt đặt giá nào.
        </p>
      ) : (
        <div className="relative z-10 mt-4 flex flex-1 flex-col space-y-3">
          <div
            ref={scrollContainerRef}
            className="min-h-64 max-h-96 overflow-y-auto rounded-2xl border border-theme-line bg-theme-bg/80 p-3 backdrop-blur-sm lg:flex-1"
          >
            <ul className="space-y-2.5">
              {bidsAsc.map((event, index) => (
                <li
                  key={event.key}
                  className="rounded-xl border border-theme-line bg-theme-panel p-3 text-sm transition-colors hover:border-theme-brand/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-theme-heading">
                        {event.bidderLabel}
                      </p>
                      <p className="mt-1 text-xs text-theme-muted">
                        {event.timeLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-theme-brand">
                        {event.amountLabel}
                      </p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-theme-muted">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-theme-line bg-[linear-gradient(180deg,var(--surface-strong),color-mix(in_srgb,var(--surface-strong)_78%,var(--primary-soft)))] p-4 shadow-[0_18px_40px_-30px_var(--glow)] backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-theme-brand">
                  Đặt giá ngay
                </p>
                <p className="mt-1 text-sm text-theme-muted">
                  Mức gợi ý hiện tại: {toAmountLabel(suggestedAmount)}
                </p>
              </div>
              <span className="rounded-full border border-theme-line bg-theme-bg px-3 py-1 text-[11px] font-medium text-theme-muted">
                Ưu tiên giá hợp lệ
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-theme-muted">
                Số tiền bid
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9.]*"
                    min={1}
                    step={1000}
                    value={bidAmountInput}
                    onChange={(event) => {
                      setBidAmountInput(formatBidInput(event.target.value));
                    }}
                    className="h-12 w-full rounded-2xl border border-theme-line bg-theme-panel px-4 pr-20 text-base font-semibold text-theme-heading outline-none transition-colors placeholder:font-normal placeholder:text-theme-muted focus:border-theme-brand focus:ring-2 focus:ring-theme-brand/15"
                    placeholder="Nhập mức giá"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-theme-muted">
                    VND
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void placeBid();
                  }}
                  disabled={isSubmittingBid}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-theme-brand px-5 text-sm font-semibold text-theme-brand-foreground shadow-[0_14px_30px_-16px_var(--glow)] transition-all hover:-translate-y-0.5 hover:bg-theme-brand/90 hover:shadow-[0_18px_36px_-18px_var(--glow)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 sm:min-w-36"
                >
                  {isSubmittingBid ? "Đang gửi..." : "Xác nhận bid"}
                </button>
              </div>

              {submitError ? (
                <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-500">
                  {submitError}
                </p>
              ) : null}
              {submitMessage ? (
                <p className="rounded-2xl border border-theme-brand/25 bg-theme-brand/10 px-3 py-2 text-xs text-theme-brand">
                  {submitMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
