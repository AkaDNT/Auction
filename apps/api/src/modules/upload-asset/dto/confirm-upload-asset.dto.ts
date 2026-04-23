import { UploadAssetScope } from '@repo/db';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ConfirmUploadAssetDto {
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @IsEnum(UploadAssetScope)
  scope!: UploadAssetScope;
}
