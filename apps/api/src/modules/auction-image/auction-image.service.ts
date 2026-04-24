import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuctionImage, AuctionStatus, Role } from '@prisma/client';
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

    this.assertAuctionImagesEditable(auction);

    const extension = this.extractExtension(dto.fileName, dto.contentType);
    const storageKey = `auctions/${auction.id}/images/${Date.now()}-${randomUUID()}.${extension}`;

    const result = await this.storage.createPresignedUpload({
      key: storageKey,
      contentType: dto.contentType,
      expiresInSeconds: 300,
    });

    const existingImages = await this.imageRepo.findByAuctionId(auction.id);
    const nextSortOrder = this.resolveSortOrderFromImages(
      existingImages,
      dto.sortOrder,
    );

    return {
      storageKey: result.key,
      uploadUrl: result.uploadUrl,
      fileUrl: result.fileUrl,
      expiresInSeconds: result.expiresInSeconds,
      metadata: {
        altText: dto.altText ?? null,
        sortOrder: nextSortOrder,
        isPrimary: dto.isPrimary ?? existingImages.length === 0,
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

    this.assertAuctionImagesEditable(auction);
    this.assertAuctionImageStorageKey(auction.id, dto.storageKey);

    const existingImages = await this.imageRepo.findByAuctionId(auction.id);
    const shouldSetPrimary = dto.isPrimary ?? existingImages.length === 0;
    const nextSortOrder = this.resolveSortOrderFromImages(
      existingImages,
      dto.sortOrder,
    );

    if (shouldSetPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(auction.id);
    }

    const createdImage = await this.imageRepo.create({
      auctionId: auction.id,
      imageUrl: this.storage.getFileUrl(dto.storageKey),
      storageKey: dto.storageKey,
      altText: dto.altText ?? null,
      sortOrder: nextSortOrder,
      isPrimary: shouldSetPrimary,
    });

    if (shouldSetPrimary) {
      await this.auctionRepo.update(auction.id, {
        thumbnailUrl: createdImage.imageUrl,
      });
    }

    return createdImage;
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
    const { image, auction } = await this.getAccessibleImageOrThrow(
      imageId,
      actorId,
      roles,
    );

    this.assertAuctionImagesEditable(auction);

    const shouldSetPrimary = dto.isPrimary === true;
    const shouldUnsetPrimary = dto.isPrimary === false && image.isPrimary;

    if (shouldSetPrimary) {
      await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);
    }

    const updatedImage = await this.imageRepo.update(imageId, {
      altText: dto.altText,
      sortOrder: dto.sortOrder,
      isPrimary: dto.isPrimary,
    });

    if (shouldSetPrimary) {
      await this.auctionRepo.update(image.auctionId, {
        thumbnailUrl: updatedImage.imageUrl,
      });
    }

    if (shouldUnsetPrimary) {
      await this.promoteNextPrimaryOrClearThumbnail(image.auctionId, image.id);
    }

    return updatedImage;
  }

  async removeImage(imageId: string, actorId: string, roles: string[]) {
    const { image, auction } = await this.getAccessibleImageOrThrow(
      imageId,
      actorId,
      roles,
    );

    this.assertAuctionImagesEditable(auction);

    const deletedImage = await this.imageRepo.delete(imageId);

    if (image.isPrimary) {
      await this.promoteNextPrimaryOrClearThumbnail(image.auctionId, image.id);
    } else if (auction.thumbnailUrl === image.imageUrl) {
      await this.auctionRepo.update(image.auctionId, {
        thumbnailUrl: null,
      });
    }

    if (image.storageKey) {
      try {
        await this.storage.deleteObject(image.storageKey);
      } catch {
        // DB state has already been fixed. Object cleanup can be retried later.
      }
    }

    return deletedImage;
  }

  async setPrimary(imageId: string, actorId: string, roles: string[]) {
    const { image, auction } = await this.getAccessibleImageOrThrow(
      imageId,
      actorId,
      roles,
    );

    this.assertAuctionImagesEditable(auction);

    await this.imageRepo.clearPrimaryByAuctionId(image.auctionId);

    const primaryImage = await this.imageRepo.update(imageId, {
      isPrimary: true,
    });

    await this.auctionRepo.update(image.auctionId, {
      thumbnailUrl: primaryImage.imageUrl,
    });

    return primaryImage;
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

    const auction = await this.getAccessibleAuctionOrThrow(
      image.auctionId,
      actorId,
      roles,
    );

    return { image, auction };
  }

  private resolveSortOrderFromImages(
    existingImages: Pick<AuctionImage, 'sortOrder'>[],
    sortOrder?: number,
  ): number {
    if (sortOrder !== undefined) {
      return sortOrder;
    }

    const maxSortOrder = existingImages.reduce(
      (currentMax, image) => Math.max(currentMax, image.sortOrder ?? 0),
      -1,
    );

    return maxSortOrder + 1;
  }

  private async promoteNextPrimaryOrClearThumbnail(
    auctionId: string,
    excludedImageId?: string,
  ) {
    const remainingImages = (await this.imageRepo.findByAuctionId(auctionId))
      .filter((image) => image.id !== excludedImageId)
      .sort((left, right) => {
        const leftSortOrder = left.sortOrder ?? 0;
        const rightSortOrder = right.sortOrder ?? 0;

        return leftSortOrder - rightSortOrder;
      });

    const nextPrimaryCandidate = remainingImages[0];

    if (!nextPrimaryCandidate) {
      await this.auctionRepo.update(auctionId, {
        thumbnailUrl: null,
      });

      return null;
    }

    await this.imageRepo.clearPrimaryByAuctionId(auctionId);

    const nextPrimary = await this.imageRepo.update(nextPrimaryCandidate.id, {
      isPrimary: true,
    });

    await this.auctionRepo.update(auctionId, {
      thumbnailUrl: nextPrimary.imageUrl,
    });

    return nextPrimary;
  }

  private assertAuctionImageStorageKey(
    auctionId: string,
    storageKey: string,
  ): void {
    const expectedPrefix = `auctions/${auctionId}/images/`;

    if (!storageKey.startsWith(expectedPrefix) || storageKey.includes('..')) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Storage key không hợp lệ',
          details: { auctionId, storageKey },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertAuctionImagesEditable(auction: {
    id: string;
    status: AuctionStatus;
  }): void {
    if (
      auction.status === AuctionStatus.LIVE ||
      auction.status === AuctionStatus.ENDED
    ) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message:
            'Không thể thay đổi hình ảnh khi phiên đấu giá đang hoặc đã diễn ra',
          details: {
            auctionId: auction.id,
            status: auction.status,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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
