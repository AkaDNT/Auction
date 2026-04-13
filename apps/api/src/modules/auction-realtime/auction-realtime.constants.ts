export const AUCTION_WS_NAMESPACE = '/auctions';

export const AUCTION_WS_EVENTS = {
  JOIN: 'auction:join',
  LEAVE: 'auction:leave',
  JOINED: 'auction:joined',
  LEFT: 'auction:left',
  BID_PLACED: 'auction:bidPlaced',
} as const;

export const getAuctionRoomName = (auctionId: string) => `auction:${auctionId}`;
