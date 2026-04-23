import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUploadAssetRepository } from './upload-asset.repository';

@Injectable()
export class UploadAssetPrismaRepository implements IUploadAssetRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  create(data: Prisma.UploadAssetUncheckedCreateInput) {
    return this.prisma.uploadAsset.create({ data });
  }

  findById(id: string) {
    return this.prisma.uploadAsset.findUnique({
      where: { id },
    });
  }

  findByStorageKey(storageKey: string) {
    return this.prisma.uploadAsset.findUnique({
      where: { storageKey },
    });
  }

  update(id: string, data: Prisma.UploadAssetUncheckedUpdateInput) {
    return this.prisma.uploadAsset.update({
      where: { id },
      data,
    });
  }
}
