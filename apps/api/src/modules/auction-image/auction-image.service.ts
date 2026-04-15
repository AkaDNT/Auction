import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import * as auctionImageRepository from './auction-image.repository';
import * as auctionRepository from '../auction/auction.repository';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';
import { UpdateAuctionImageDto } from './dto/update-auction-image.dto';
import { CreateAuctionImageUploadDto } from './dto/create-auction-image-upload.dto';
import { ConfirmAuctionImageDto } from './dto/confirm-auction-image.dto';
import * as objectStoragePort from '../storage/contracts/object-storage.port';

@Injectable()
export class AuctionImageService {
  constructor(
    @Inject(auctionImageRepository.AUCTION_IMAGE_REPOSITORY)
    private readonly imageRepo: auctionImageRepository.IAuctionImageRepository,
    @Inject(auctionRepository.AUCTION_REPOSITORY)
    private readonly auctionRepo: auctionRepository.IAuctionRepository,
    @Inject(objectStoragePort.OBJECT_STORAGE_PORT)
    private readonly storage: objectStoragePort.IObjectStoragePort,
  ) {}

  async createUploadUrl(
    auctionId: string,
    dto: CreateAuctionImageUploadDto,
    actorId: string,
    roles: string[],
  ) {
    const auction = await this.getAccessibleAuctionOrThrow(
      auctionId,
      actorId,
      roles,
    );

    const extension = this.extractExtension(dto.fileName, dto.contentType);
    const storageKey = `auctions/${auction.id}/images/${Date.now()}-${randomUUID()}.${extension}`;

    const result = await this.storage.createPresignedUpload({
      key: storageKey,
      contentType: dto.contentType,
      expiresInSeconds: 300,
    });

    return {
      storageKey: result.key,
      uploadUrl: result.uploadUrl,
      fileUrl: result.fileUrl,
      expiresInSeconds: result.expiresInSeconds,
      metadata: {
        altText: dto.altText ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isPrimary: dto.isPrimary ?? false,
      },
    };
  }

  async confirmUpload(
    auctionId: string,
    dto: ConfirmAuctionImageDto,
    actorId: string,
    roles: string[],
  ) {
    const auction = await this.getAccessibleAuctionOrThrow(
      auctionId,
      actorId,
      roles,
    );

    if (dto.isPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(auction.id);
    }

    return this.imageRepo.create({
      auctionId: auction.id,
      imageUrl: this.storage.getFileUrl(dto.storageKey),
      storageKey: dto.storageKey,
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
    roles: string[],
  ) {
    const image = await this.getAccessibleImageOrThrow(imageId, actorId, roles);

    if (dto.isPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);
    }

    return this.imageRepo.update(imageId, {
      altText: dto.altText,
      sortOrder: dto.sortOrder,
      isPrimary: dto.isPrimary,
    });
  }

  async removeImage(imageId: string, actorId: string, roles: string[]) {
    const image = await this.getAccessibleImageOrThrow(imageId, actorId, roles);

    if (image.storageKey) {
      await this.storage.deleteObject(image.storageKey);
    }

    return this.imageRepo.delete(imageId);
  }

  async setPrimary(imageId: string, actorId: string, roles: string[]) {
    const image = await this.getAccessibleImageOrThrow(imageId, actorId, roles);

    await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);

    return this.imageRepo.update(imageId, { isPrimary: true });
  }

  private async getAccessibleAuctionOrThrow(
    auctionId: string,
    actorId: string,
    roles: string[],
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

    if (!roles.includes(Role.ADMIN) && auction.sellerId !== actorId) {
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
    roles: string[],
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

    await this.getAccessibleAuctionOrThrow(image.auctionId, actorId, roles);

    return image;
  }

  private extractExtension(fileName: string, contentType: string): string {
    const normalizedFileName = fileName.toLowerCase();

    if (
      normalizedFileName.endsWith('.jpg') ||
      normalizedFileName.endsWith('.jpeg')
    ) {
      return 'jpg';
    }

    if (normalizedFileName.endsWith('.png')) {
      return 'png';
    }

    if (normalizedFileName.endsWith('.webp')) {
      return 'webp';
    }

    switch (contentType) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        throw new AppException(
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Định dạng ảnh không hợp lệ',
            details: { fileName, contentType },
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }
}
