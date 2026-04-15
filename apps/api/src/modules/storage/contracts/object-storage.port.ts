export const OBJECT_STORAGE_PORT = Symbol('OBJECT_STORAGE_PORT');

export interface UploadObjectParams {
  key: string;
  body: Buffer;
  contentType: string;
}

export interface PresignedUploadParams {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface UploadedObjectResult {
  key: string;
  url: string;
}

export interface PresignedUploadResult {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
}

export interface IObjectStoragePort {
  uploadObject(params: UploadObjectParams): Promise<UploadedObjectResult>;
  createPresignedUpload(
    params: PresignedUploadParams,
  ): Promise<PresignedUploadResult>;
  deleteObject(key: string): Promise<void>;
  getFileUrl(key: string): string;
}
