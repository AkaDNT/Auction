import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuctionStatus, Role } from '@prisma/client';
import slugify from 'slugify';
import * as auctionRepository from './auction.repository';
import * as auctionCategoryRepository from '../auction-category/auction-category.repository';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { ListAuctionDto } from './dto/list-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { AuctionLifecycleService } from '../auction-lifecycle/auction-lifecycle.service';

@Injectable()
export class AuctionService {
  constructor(
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,
    @Inject(auctionCategoryRepository.AUCTION_CATEGORY_REPOSITORY)
    private readonly categoryRepo: auctionCategoryRepository.IAuctionCategoryRepository,
    private readonly auctionLifecycleService: AuctionLifecycleService,
  ) {}

  async create(dto: CreateAuctionDto, sellerId: string) {
    const category = await this.categoryRepo.findById(dto.categoryId);
    if (!category) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_NOT_FOUND,
          message: 'Không tìm thấy danh mục đấu giá',
          details: { categoryId: dto.categoryId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    this.validateTimeRange(dto.startAt, dto.endAt);
    this.validatePrices(dto.startingPrice, dto.buyNowPrice);

    const code = await this.generateAuctionCode();
    const slug = await this.generateUniqueSlug(dto.title);

    return this.auctionRepo.create({
      code,
      title: dto.title,
      slug,
      description: dto.description,
      startingPrice: dto.startingPrice,
      currentPrice: dto.startingPrice,
      buyNowPrice: dto.buyNowPrice,
      minBidIncrement: dto.minBidIncrement,
      startAt: dto.startAt ? new Date(dto.startAt) : null,
      endAt: new Date(dto.endAt),
      status: AuctionStatus.DRAFT,
      thumbnailUrl: dto.thumbnailUrl,
      seller: {
        connect: { id: sellerId },
      },
      category: {
        connect: { id: dto.categoryId },
      },
    });
  }

  async findAll(query: ListAuctionDto) {
    const [items, total] = await Promise.all([
      this.auctionRepo.findMany(query),
      this.auctionRepo.count(query),
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

  async findMine(query: ListAuctionDto, sellerId: string) {
    const [items, total] = await Promise.all([
      this.auctionRepo.findMany({
        ...query,
        sellerId,
      }),
      this.auctionRepo.count({
        ...query,
        sellerId,
      }),
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

  async findMineOne(id: string, sellerId: string) {
    const auction = await this.auctionRepo.findById(id);

    if (!auction || auction.sellerId !== sellerId) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return auction;
  }

  async findOne(id: string) {
    const auction = await this.auctionRepo.findById(id);
    if (!auction) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return auction;
  }

  async findOneBySlug(slug: string) {
    const auction = await this.auctionRepo.findBySlug(slug);
    if (!auction) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { slug },
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return auction;
  }

  async findFeatured() {
    const items = await this.auctionRepo.findFeaturedLiveAuctions(2);

    return {
      items,
      meta: {
        total: items.length,
      },
    };
  }

  async update(id: string, sellerId: string, dto: UpdateAuctionDto) {
    const current = await this.auctionRepo.findById(id);

    if (!current || current.sellerId !== sellerId) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (current.status !== AuctionStatus.DRAFT) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_UPDATE_NOT_ALLOWED,
          message: 'Chỉ có thể cập nhật phiên đấu giá ở trạng thái nháp',
          details: { id, status: current.status },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.categoryId) {
      const category = await this.categoryRepo.findById(dto.categoryId);
      if (!category) {
        throw new AppException(
          {
            code: ERROR_CODES.AUCTION_CATEGORY_NOT_FOUND,
            message: 'Không tìm thấy danh mục đấu giá',
            details: { categoryId: dto.categoryId },
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    this.validateTimeRange(
      dto.startAt ?? current.startAt?.toISOString(),
      dto.endAt ?? current.endAt.toISOString(),
    );

    this.validatePrices(
      dto.startingPrice ?? Number(current.startingPrice),
      dto.buyNowPrice ??
        (current.buyNowPrice ? Number(current.buyNowPrice) : undefined),
    );

    let nextSlug: string | undefined;

    nextSlug = await this.generateUniqueSlug(dto.title!, current.id);

    const auctionReturnValue = this.auctionRepo.update(id, {
      title: dto.title,
      slug: nextSlug,
      description: dto.description,
      startingPrice: dto.startingPrice,
      buyNowPrice: dto.buyNowPrice,
      minBidIncrement: dto.minBidIncrement,
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
      thumbnailUrl: dto.thumbnailUrl,
      ...(dto.categoryId
        ? {
            category: {
              connect: { id: dto.categoryId },
            },
          }
        : {}),
    });

    return auctionReturnValue;
  }

  async publish(id: string, sellerId: string) {
    const auction = await this.findOne(id);

    if (auction.sellerId !== sellerId) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (auction.status !== AuctionStatus.DRAFT) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_STATUS,
          message: 'Chỉ có thể phát hành phiên đấu giá ở trạng thái nháp',
          details: { id, currentStatus: auction.status },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const now = new Date();
    if (auction.endAt <= now) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_ALREADY_ENDED,
          message: 'Không thể phát hành phiên đấu giá đã kết thúc',
          details: { id, endAt: auction.endAt },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const nextStatus =
      !auction.startAt || auction.startAt <= now
        ? AuctionStatus.LIVE
        : AuctionStatus.UPCOMING;

    const updatedAuction = await this.auctionRepo.update(id, {
      status: nextStatus,
    });

    await this.syncAuctionEndJob({
      id: updatedAuction.id,
      endAt: updatedAuction.endAt,
      status: updatedAuction.status,
    });

    return updatedAuction;
  }

  async cancel(id: string, sellerId: string, role: string) {
    const current = await this.findOne(id);

    if (current.sellerId !== sellerId && !role.includes(Role.ADMIN)) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedAuction = await this.auctionRepo.update(id, {
      status: AuctionStatus.CANCELLED,
    });

    await this.auctionLifecycleService.cancelEndAuction(current.id);

    return updatedAuction;
  }

  async remove(id: string, sellerId: string) {
    const auction = await this.findOne(id);

    if (auction.sellerId !== sellerId) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_NOT_FOUND,
          message: 'Không tìm thấy phiên đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (auction.status !== AuctionStatus.DRAFT) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_DELETE_NOT_ALLOWED,
          message: 'Chỉ có thể xóa phiên đấu giá ở trạng thái nháp',
          details: { id, status: auction.status },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.auctionRepo.delete(id);
  }

  private async generateAuctionCode() {
    for (let i = 0; i < 10; i++) {
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
        now.getDate(),
      ).padStart(2, '0')}`;
      const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
      const code = `AUC-${datePart}-${randomPart}`;

      const existed = await this.auctionRepo.findByCode(code);
      if (!existed) return code;
    }

    throw new AppException(
      {
        code: ERROR_CODES.AUCTION_CODE_ALREADY_EXISTS,
        message: 'Không thể tạo mã phiên đấu giá duy nhất. Vui lòng thử lại',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private async generateUniqueSlug(input: string, excludeId?: string) {
    const baseSlug = this.toSlug(input);

    for (let i = 0; i < 50; i++) {
      const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
      const existed = await this.auctionRepo.findBySlug(candidate);

      if (!existed || existed.id === excludeId) {
        return candidate;
      }
    }

    throw new AppException(
      {
        code: ERROR_CODES.AUCTION_SLUG_ALREADY_EXISTS,
        message: 'Không thể tạo đường dẫn phiên đấu giá duy nhất',
        details: { input },
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  private toSlug(value: string) {
    const slug = slugify(value, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!slug) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_SLUG,
          message: 'Tiêu đề không hợp lệ để tạo đường dẫn',
          details: { value },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return slug;
  }

  private validateTimeRange(startAt?: string | null, endAt?: string | null) {
    if (!endAt) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_TIME_RANGE,
          message: 'Thời gian kết thúc là bắt buộc (endAt)',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const end = new Date(endAt);
    if (Number.isNaN(end.getTime())) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_TIME_RANGE,
          message: 'Thời gian kết thúc không hợp lệ (endAt)',
          details: { endAt },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (startAt) {
      const start = new Date(startAt);
      if (Number.isNaN(start.getTime()) || start >= end) {
        throw new AppException(
          {
            code: ERROR_CODES.AUCTION_INVALID_TIME_RANGE,
            message: 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc',
            details: { startAt, endAt },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private validatePrices(startingPrice: number, buyNowPrice?: number) {
    if (startingPrice < 0) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_PRICE,
          message: 'Giá khởi điểm phải lớn hơn hoặc bằng 0',
          details: { startingPrice },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (buyNowPrice !== undefined && buyNowPrice < startingPrice) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_INVALID_PRICE,
          message: 'Giá mua ngay phải lớn hơn hoặc bằng giá khởi điểm',
          details: { startingPrice, buyNowPrice },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async syncAuctionEndJob(auction: {
    id: string;
    endAt: Date;
    status: AuctionStatus;
  }): Promise<void> {
    await this.auctionLifecycleService.syncEndAuctionJob({
      auctionId: auction.id,
      endAt: auction.endAt,
      shouldSchedule:
        auction.status === AuctionStatus.LIVE ||
        auction.status === AuctionStatus.UPCOMING,
    });
  }
}
