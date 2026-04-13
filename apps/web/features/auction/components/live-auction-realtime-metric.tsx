"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AUCTION_WS_EVENTS,
  createAuctionRealtimeSocket,
  type AuctionBidPlacedEvent,
} from "@/features/auction/services/auction-realtime.client";

type LiveBidCountTextProps = {
  auctionId: string;
  initialCount: number;
};

type LiveCurrentPriceTextProps = {
  auctionId: string;
  initialAmount: number;
};

function toCurrencyLabel(amount: number) {
  if (!Number.isFinite(amount)) {
    return "Chua thiet lap";
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

export function LiveBidCountText({
  auctionId,
  initialCount,
}: LiveBidCountTextProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const socket = createAuctionRealtimeSocket();

    socket.on("connect", () => {
      socket.emit(AUCTION_WS_EVENTS.JOIN, { auctionId });
    });

    socket.on(AUCTION_WS_EVENTS.BID_PLACED, (event: AuctionBidPlacedEvent) => {
      if (event.auctionId !== auctionId) {
        return;
      }

      setCount((current) => current + 1);
    });

    return () => {
      socket.emit(AUCTION_WS_EVENTS.LEAVE, { auctionId });
      socket.disconnect();
    };
  }, [auctionId]);

  return <>{count}</>;
}

export function LiveCurrentPriceText({
  auctionId,
  initialAmount,
}: LiveCurrentPriceTextProps) {
  const [amount, setAmount] = useState(initialAmount);

  useEffect(() => {
    const socket = createAuctionRealtimeSocket();

    socket.on("connect", () => {
      socket.emit(AUCTION_WS_EVENTS.JOIN, { auctionId });
    });

    socket.on(AUCTION_WS_EVENTS.BID_PLACED, (event: AuctionBidPlacedEvent) => {
      if (event.auctionId !== auctionId) {
        return;
      }

      const nextAmount = Number(event.amount);
      if (!Number.isFinite(nextAmount)) {
        return;
      }

      setAmount(nextAmount);
    });

    return () => {
      socket.emit(AUCTION_WS_EVENTS.LEAVE, { auctionId });
      socket.disconnect();
    };
  }, [auctionId]);

  const amountLabel = useMemo(() => toCurrencyLabel(amount), [amount]);

  return <>{amountLabel}</>;
}
