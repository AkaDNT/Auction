import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  AUCTION_WS_EVENTS,
  AUCTION_WS_NAMESPACE,
  getAuctionRoomName,
} from './auction-realtime.constants';
import { JoinAuctionRoomDto } from './dto/join-auction-room.dto';
import { BidPlacedEventDto } from './dto/bid-placed.event.dto';

@WebSocketGateway({
  namespace: AUCTION_WS_NAMESPACE,
  cors: {
    credentials: true,
    origin: [
      'https://example.com',
      'https://admin.example.com',
      'https://app.example.com',
      'http://localhost:4000',
      'http://localhost:3000',
    ],
  },
})
export class AuctionRealtimeGateway {
  @WebSocketServer()
  private server!: Server;

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage(AUCTION_WS_EVENTS.JOIN)
  handleJoin(
    @MessageBody() dto: JoinAuctionRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = getAuctionRoomName(dto.auctionId);
    client.join(room);

    client.emit(AUCTION_WS_EVENTS.JOINED, {
      auctionId: dto.auctionId,
      room,
    });

    return {
      success: true,
      auctionId: dto.auctionId,
    };
  }

  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @SubscribeMessage(AUCTION_WS_EVENTS.LEAVE)
  handleLeave(
    @MessageBody() dto: JoinAuctionRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const room = getAuctionRoomName(dto.auctionId);
    client.leave(room);

    client.emit(AUCTION_WS_EVENTS.LEFT, {
      auctionId: dto.auctionId,
      room,
    });

    return {
      success: true,
      auctionId: dto.auctionId,
    };
  }

  emitBidPlaced(event: BidPlacedEventDto) {
    this.server
      .to(getAuctionRoomName(event.auctionId))
      .emit(AUCTION_WS_EVENTS.BID_PLACED, event);
  }
}
