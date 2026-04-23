import { Prisma, UploadAsset } from '@prisma/client';

export const UPLOAD_ASSET_REPOSITORY = Symbol('UPLOAD_ASSET_REPOSITORY');

export interface IUploadAssetRepository {
  create(data: Prisma.UploadAssetUncheckedCreateInput): Promise<UploadAsset>;
  findById(id: string): Promise<UploadAsset | null>;
  findByStorageKey(storageKey: string): Promise<UploadAsset | null>;
  update(
    id: string,
    data: Prisma.UploadAssetUncheckedUpdateInput,
  ): Promise<UploadAsset>;
}
