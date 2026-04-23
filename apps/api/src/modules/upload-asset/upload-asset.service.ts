import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  UploadAsset,
  UploadAssetScope,
  UploadAssetStatus,
} from '@prisma/client';
import { AppException } from 'src/common/errors/app.exception';
import { ERROR_CODES } from '@repo/shared';
import * as objectStoragePort from '../storage/contracts/object-storage.port';
import * as uploadAssetRepository from './upload-asset.repository';
import { ConfirmUploadAssetDto } from './dto/confirm-upload-asset.dto';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';

@Injectable()
export class UploadAssetService {
  constructor(
    @Inject(uploadAssetRepository.UPLOAD_ASSET_REPOSITORY)
    private readonly uploadAssetRepo: uploadAssetRepository.IUploadAssetRepository,
    @Inject(objectStoragePort.OBJECT_STORAGE_PORT)
    private readonly storage: objectStoragePort.IObjectStoragePort,
  ) {}

  async createUploadUrl(dto: CreateUploadUrlDto, ownerId: string) {
    this.validateImageContentType(dto.contentType);

    const extension = this.extractExtension(dto.fileName, dto.contentType);
    const storageKey = this.buildTempStorageKey({
      ownerId,
      scope: dto.scope,
      extension,
    });

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
    };
  }

  async confirmUpload(dto: ConfirmUploadAssetDto, ownerId: string) {
    const existing = await this.uploadAssetRepo.findByStorageKey(
      dto.storageKey,
    );

    if (existing) {
      if (existing.ownerId !== ownerId) {
        throw new AppException(
          {
            code: ERROR_CODES.AUTH_FORBIDDEN,
            message: 'Bạn không có quyền truy cập tệp này',
            details: { storageKey: dto.storageKey },
          },
          HttpStatus.FORBIDDEN,
        );
      }

      if (existing.scope !== dto.scope) {
        throw new AppException(
          {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Loại tài nguyên tải lên không hợp lệ',
            details: {
              storageKey: dto.storageKey,
              expectedScope: dto.scope,
              actualScope: existing.scope,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      return existing;
    }

    return this.uploadAssetRepo.create({
      ownerId,
      storageKey: dto.storageKey,
      fileUrl: this.storage.getFileUrl(dto.storageKey),
      fileName: dto.storageKey.split('/').pop() ?? dto.storageKey,
      contentType: this.detectContentTypeFromKey(dto.storageKey),
      scope: dto.scope,
      status: UploadAssetStatus.READY,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async assertReady(
    assetId: string,
    ownerId: string,
    scope: UploadAssetScope,
  ): Promise<UploadAsset> {
    const asset = await this.uploadAssetRepo.findById(assetId);

    if (!asset) {
      throw new AppException(
        {
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
          message: 'Không tìm thấy tệp đã tải lên',
          details: { assetId },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (asset.ownerId !== ownerId) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_FORBIDDEN,
          message: 'Bạn không có quyền sử dụng tệp này',
          details: { assetId },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (asset.scope !== scope) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tệp không đúng mục đích sử dụng',
          details: {
            assetId,
            expectedScope: scope,
            actualScope: asset.scope,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (asset.status !== UploadAssetStatus.READY) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tệp chưa sẵn sàng để sử dụng',
          details: {
            assetId,
            status: asset.status,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (asset.expiresAt && asset.expiresAt <= new Date()) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tệp đã hết hạn sử dụng',
          details: {
            assetId,
            expiresAt: asset.expiresAt,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return asset;
  }

  async markConsumed(assetId: string) {
    return this.uploadAssetRepo.update(assetId, {
      status: UploadAssetStatus.CONSUMED,
      usedAt: new Date(),
    });
  }

  private buildTempStorageKey(params: {
    ownerId: string;
    scope: UploadAssetScope;
    extension: string;
  }) {
    const scopeSegment = params.scope.toLowerCase();
    return `temp/uploads/${scopeSegment}/${params.ownerId}/${Date.now()}-${randomUUID()}.${params.extension}`;
  }

  private extractExtension(fileName: string, contentType: string): string {
    const normalized = fileName.toLowerCase();

    if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg'))
      return 'jpg';
    if (normalized.endsWith('.png')) return 'png';
    if (normalized.endsWith('.webp')) return 'webp';

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
            message: 'Định dạng tệp không hợp lệ',
            details: { fileName, contentType },
          },
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private validateImageContentType(contentType: string) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(contentType)) {
      throw new AppException(
        {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP',
          details: { contentType },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private detectContentTypeFromKey(storageKey: string): string {
    const lower = storageKey.toLowerCase();

    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';

    return 'application/octet-stream';
  }
}
