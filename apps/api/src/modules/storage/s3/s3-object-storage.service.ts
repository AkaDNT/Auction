import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IObjectStoragePort,
  PresignedUploadParams,
  PresignedUploadResult,
  UploadObjectParams,
  UploadedObjectResult,
} from '../contracts/object-storage.port';

@Injectable()
export class S3ObjectStorageService implements IObjectStoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly fileBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.config.getOrThrow<string>('AWS_REGION');

    this.fileBaseUrl =
      this.config.get<string>('AWS_CLOUDFRONT_BASE_URL') ||
      this.config.get<string>('AWS_S3_PUBLIC_BASE_URL') ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async uploadObject(
    params: UploadObjectParams,
  ): Promise<UploadedObjectResult> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );

    return {
      key: params.key,
      url: this.getFileUrl(params.key),
    };
  }

  async createPresignedUpload(
    params: PresignedUploadParams,
  ): Promise<PresignedUploadResult> {
    const expiresInSeconds = params.expiresInSeconds ?? 300;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });

    return {
      key: params.key,
      uploadUrl,
      fileUrl: this.getFileUrl(params.key),
      expiresInSeconds,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getFileUrl(key: string): string {
    return `${this.fileBaseUrl.replace(/\/$/, '')}/${key}`;
  }
}
