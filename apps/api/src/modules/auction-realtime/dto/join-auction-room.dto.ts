import { IsString, IsNotEmpty } from 'class-validator';

export class JoinAuctionRoomDto {
  @IsString()
  @IsNotEmpty()
  auctionId!: string;
}
