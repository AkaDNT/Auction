import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UploadAssetScope } from '../enum/upload-asset.enums';

export class CreateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @IsEnum(UploadAssetScope)
  scope!: UploadAssetScope;
}
