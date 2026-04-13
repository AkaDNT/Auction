import { io, type Socket } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3999";

export const AUCTION_WS_NAMESPACE = "/auctions";

export const AUCTION_WS_EVENTS = {
  JOIN: "auction:join",
  LEAVE: "auction:leave",
  JOINED: "auction:joined",
  LEFT: "auction:left",
  BID_PLACED: "auction:bidPlaced",
} as const;

export type AuctionRoomEvent = {
  auctionId: string;
  room: string;
};

export type AuctionBidPlacedEvent = {
  auctionId: string;
  bidderId: string;
  amount: number;
  placedAt: string;
};

export function createAuctionRealtimeSocket(): Socket {
  return io(`${API_BASE_URL}${AUCTION_WS_NAMESPACE}`, {
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    reconnection: true,
  });
}
