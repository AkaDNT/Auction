import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OBJECT_STORAGE_PORT } from './contracts/object-storage.port';
import { S3ObjectStorageService } from './s3/s3-object-storage.service';

@Module({
  imports: [ConfigModule],
  providers: [
    S3ObjectStorageService,
    {
      provide: OBJECT_STORAGE_PORT,
      useExisting: S3ObjectStorageService,
    },
  ],
  exports: [OBJECT_STORAGE_PORT],
})
export class StorageModule {}
