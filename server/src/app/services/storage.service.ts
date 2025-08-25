type StorageClass =
  | "DEEP_ARCHIVE"
  | "EXPRESS_ONEZONE"
  | "GLACIER"
  | "GLACIER_IR"
  | "INTELLIGENT_TIERING"
  | "ONEZONE_IA"
  | "OUTPOSTS"
  | "REDUCED_REDUNDANCY"
  | "SNOW"
  | "STANDARD"
  | "STANDARD_IA";

export abstract class StorageService {
  // ext
  abstract getObjectFullUrl(key: string): string;

  // objects
  abstract getObjectPresignedUrl(key: string, range?: string): Promise<string>;
  abstract getObject(key: string): Promise<{
    body: Uint8Array;
    range: string;
    length: number;
  }>;
  abstract generatePutPresignedUrl(
    key: string,
    options?: { type?: string; acl?: string }
  ): Promise<string>;
  abstract deleteObject(key: string): Promise<number>;

  // Multipart upload

  abstract createMultipartUpload(
    key: string,
    size: number,
    type?: string,
    storageClass?: StorageClass
  ): Promise<{ multipartUploadId: string }>;
  abstract getMultipartUploadPresignedUrls(
    key: string,
    multipartUploadId: string,
    size: number
  ): Promise<string[]>;
  abstract completeMultipartUpload(
    key: string,
    multipartUploadId: string,
    parts: {
      ETag: string;
      PartNumber: number;
    }[]
  ): Promise<void>;
}
