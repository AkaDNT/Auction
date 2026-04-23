import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadAssetService } from './upload-asset.service';
import { UPLOAD_ASSET_REPOSITORY } from './upload-asset.repository';
import { SellerUploadAssetController } from './seller-upload-asset.controller';
import { UploadAssetPrismaRepository } from './upload-asset.prisma.repository';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [SellerUploadAssetController],
  providers: [
    UploadAssetService,
    UploadAssetPrismaRepository,
    {
      provide: UPLOAD_ASSET_REPOSITORY,
      useExisting: UploadAssetPrismaRepository,
    },
  ],
  exports: [UploadAssetService, UPLOAD_ASSET_REPOSITORY],
})
export class UploadAssetModule {}
