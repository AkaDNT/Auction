import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as auctionImageRepository from './auction-image.repository';
import * as auctionRepository from '../auction/auction.repository';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { AddAuctionImageDto } from './dto/add-auction-image.dto';
import { UpdateAuctionImageDto } from './dto/update-auction-image.dto';

@Injectable()
export class AuctionImageService {
  constructor(
    @Inject(auctionImageRepository.AUCTION_IMAGE_REPOSITORY)
    private readonly imageRepo: auctionImageRepository.IAuctionImageRepository,
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,
  ) {}

  async addImage(
    auctionId: string,
    dto: AddAuctionImageDto,
    actorId: string,
    role: string[],
  ) {
    const auction = await this.getAccessibleAuctionOrThrow(
      auctionId,
      actorId,
      role,
    );

    if (dto.isPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(auction.id);
    }

    return this.imageRepo.create({
      auctionId: auction.id,
      imageUrl: dto.imageUrl,
      altText: dto.altText ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isPrimary: dto.isPrimary ?? false,
    });
  }

  async listByAuction(auctionId: string) {
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

    return this.imageRepo.findByAuctionId(auctionId);
  }

  async updateImage(
    imageId: string,
    dto: UpdateAuctionImageDto,
    actorId: string,
    role: string[],
  ) {
    const image = await this.getAccessibleImageOrThrow(imageId, actorId, role);

    if (dto.isPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);
    }

    return this.imageRepo.update(imageId, {
      imageUrl: dto.imageUrl,
      altText: dto.altText,
      sortOrder: dto.sortOrder,
      isPrimary: dto.isPrimary,
    });
  }

  async removeImage(imageId: string, actorId: string, role: string[]) {
    await this.getAccessibleImageOrThrow(imageId, actorId, role);
    return this.imageRepo.delete(imageId);
  }

  async setPrimary(imageId: string, actorId: string, role: string[]) {
    const image = await this.getAccessibleImageOrThrow(imageId, actorId, role);

    await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);

    return this.imageRepo.update(imageId, { isPrimary: true });
  }

  private async getAccessibleAuctionOrThrow(
    auctionId: string,
    actorId: string,
    role: string[],
  ) {
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

    if (!role.includes(Role.ADMIN) && auction.sellerId !== actorId) {
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

  private async getAccessibleImageOrThrow(
    imageId: string,
    actorId: string,
    role: string[],
  ) {
    const image = await this.imageRepo.findById(imageId);

    if (!image) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_IMAGE_NOT_FOUND,
          message: 'Không tìm thấy hình ảnh phiên đấu giá',
          details: { imageId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.getAccessibleAuctionOrThrow(image.auctionId, actorId, role);

    return image;
  }
}
