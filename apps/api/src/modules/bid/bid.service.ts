import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuctionStatus, BidStatus } from '@prisma/client';
import * as bidRepository from './bid.repository';
import * as auctionRepository from '../auction/auction.repository';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { CreateBidDto } from './dto/create-bid.dto';
import { ListBidsDto } from './dto/list-bids.dto';
import * as auctionRealtimePublisher from '../auction-realtime/contracts/auction-realtime.publisher';

@Injectable()
export class BidService {
  constructor(
    @Inject(bidRepository.BID_REPOSITORY)
    private readonly bidRepo: bidRepository.IBidRepository,
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,
    @Inject(auctionRealtimePublisher.AUCTION_REALTIME_PUBLISHER)
    private readonly auctionRealtimePublisher: auctionRealtimePublisher.AuctionRealtimePublisher,
  ) {}

  async placeBid(auctionId: string, bidderId: string, dto: CreateBidDto) {
    const auction = await this.auctionRepo.findById(auctionId);

    if (!auction) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { auctionId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const now = new Date();

    if (auction.status !== AuctionStatus.LIVE) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_AUCTION_NOT_LIVE,
          message: 'Phiên đấu giá hiện không ở trạng thái đang diễn ra',
          details: { auctionId, status: auction.status },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (auction.startAt && auction.startAt > now) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_AUCTION_NOT_STARTED,
          message: 'Phiên đấu giá chưa bắt đầu',
          details: { auctionId, startAt: auction.startAt },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (auction.endAt <= now) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_AUCTION_ALREADY_ENDED,
          message: 'Phiên đấu giá đã kết thúc',
          details: { auctionId, endAt: auction.endAt },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (auction.sellerId === bidderId) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_SELF_BIDDING_NOT_ALLOWED,
          message: 'Người bán không thể tự đấu giá phiên của mình',
          details: { auctionId, bidderId },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.bidRepo.executePlaceBidTransaction({
      auctionId,
      bidderId,
      amount: dto.amount,
    });

    await this.auctionRealtimePublisher.publishBidPlaced({
      auctionId,
      bidderId,
      amount: dto.amount,
      placedAt: new Date(),
    });

    return {
      success: true,
      auctionId,
      bidderId,
      amount: dto.amount,
    };
  }

  async listAuctionBids(auctionId: string, query: ListBidsDto) {
    await this.ensureAuctionExists(auctionId);

    const [items, total] = await Promise.all([
      this.bidRepo.findManyByAuction(auctionId, query.page, query.limit),
      this.bidRepo.countByAuction(auctionId),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
      },
    };
  }

  async listLatest100AuctionBidsSortedByAmount(auctionId: string) {
    await this.ensureAuctionExists(auctionId);

    const items =
      await this.bidRepo.findLatest100ByAuctionOrderByAmountAsc(auctionId);

    return {
      items,
      meta: {
        total: items.length,
        limit: 100,
        sortBy: 'amount',
        sortOrder: 'asc',
        sourceWindow: 'latest_100_by_createdAt_desc',
      },
    };
  }

  async rejectBid(id: string) {
    const bid = await this.bidRepo.findById(id);

    if (!bid) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_NOT_FOUND,
          message: 'Không tìm thấy lượt trả giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.bidRepo.updateStatus(id, BidStatus.REJECTED);
  }

  async cancelBid(id: string) {
    const bid = await this.bidRepo.findById(id);

    if (!bid) {
      throw new AppException(
        {
          code: ERROR_CODES.BID_NOT_FOUND,
          message: 'Không tìm thấy lượt trả giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.bidRepo.updateStatus(id, BidStatus.CANCELLED);
  }

  private async ensureAuctionExists(auctionId: string) {
    const auction = await this.auctionRepo.findById(auctionId);

    if (!auction) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { auctionId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return auction;
  }
}
