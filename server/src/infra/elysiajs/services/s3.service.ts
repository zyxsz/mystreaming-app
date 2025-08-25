import type { StorageService } from "@/app/services/storage.service";
import { env } from "@/config/env";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  type StorageClass,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service implements StorageService {
  private s3Client: S3Client;
  private s3Bucket: string;
  private PART_SIZE: number = 10000000;

  constructor() {
    this.s3Client = new S3Client({
      forcePathStyle: true,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
      },
      endpoint: env.STORAGE_ENDPOINT,
    });
    this.s3Bucket = env.STORAGE_BUCKET!;
  }

  getObjectFullUrl(key: string): string {
    return env.STORAGE_PUBLIC_DOMAIN
      ? `https://${env.STORAGE_PUBLIC_DOMAIN}/${key}`
      : `https://s3.${env.S3_REGION}.amazonaws.com/${env.S3_BUCKET}/${key}`;
  }

  async getObjectPresignedUrl(key: string, range?: string): Promise<string> {
    const getCommand = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      // Range: range ? "bytes=" + range : undefined,
      // ResponseCacheControl: 'public, max-age=604800, immutable',
    });

    return await getSignedUrl(this.s3Client, getCommand);
  }

  async getObject<T>(
    key: string,
    range?: string
  ): Promise<{
    body: Uint8Array;
    range: string;
    length: number;
  }> {
    const getCommand = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      Range: range ? "bytes=" + range : undefined,
    });

    const response = await this.s3Client.send(getCommand);

    if (!response.Body) throw new Error("Body not found");

    return {
      body: await response.Body.transformToByteArray(),
      range: response.ContentRange!,
      length: response.ContentLength!,
    };
  }

  async generatePutPresignedUrl(
    key: string,
    options?: { type?: string; acl?: string }
  ): Promise<string> {
    const command = new PutObjectCommand({
      Key: key,
      Bucket: this.s3Bucket,
      ContentType: options?.type,
      // ContentType: options.type,
      // ContentLength: options?.length,
      // ACL: options?.acl,
      // Metadata: {
      //   "Cache-Control": "max-age=2592000,public",
      // },
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteObject(key: string): Promise<number> {
    const bucket = this.s3Bucket;
    let count = 0;

    const recursiveDelete = async (token?: string) => {
      // get the files
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: key,
        ContinuationToken: token,
      });
      const list = await this.s3Client.send(listCommand);
      if (list && list.Contents && list.KeyCount) {
        // if items to delete
        // delete the files
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: list.Contents.map((item) => ({ Key: item.Key })),
            Quiet: false,
          },
        });
        const deleted = await this.s3Client.send(deleteCommand);
        count += deleted.Deleted?.length || 0;
        // log any errors deleting files
        if (deleted.Errors) {
          deleted.Errors.map((error) =>
            console.log(`${error.Key} could not be deleted - ${error.Code}`)
          );
        }
      }
      // repeat if more files to delete
      if (list.NextContinuationToken) {
        await recursiveDelete(list.NextContinuationToken);
      }
      // return total deleted count when finished
      return `${count} files deleted.`;
    };

    const result = await recursiveDelete();

    console.log(result);

    return count;
  }

  // Multipart uploads

  async createMultipartUpload(
    key: string,
    size: number,
    type?: string,
    storageClass?: StorageClass
  ): Promise<{ multipartUploadId: string }> {
    const createMultipartUploadCommand = new CreateMultipartUploadCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ACL: "private",
      ContentType: type || "video/x-matroska",
      StorageClass: storageClass,
    });

    const startUploadResponse = await this.s3Client.send(
      createMultipartUploadCommand
    );

    const multipartUploadId = startUploadResponse.UploadId;

    if (!multipartUploadId) throw new Error("Unable to create upload");

    return { multipartUploadId };
  }

  async completeMultipartUpload(
    key: string,
    multipartUploadId: string,
    parts: { ETag: string; PartNumber: number }[]
  ): Promise<void> {
    const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
      Key: key,
      Bucket: this.s3Bucket,
      UploadId: multipartUploadId,

      MultipartUpload: {
        Parts: parts,
      },
    });

    await this.s3Client.send(completeMultipartUploadCommand);
  }

  async getMultipartUploadPresignedUrls(
    key: string,
    multipartUploadId: string,
    size: number
  ): Promise<string[]> {
    const numberOfParts = Math.ceil(size / this.PART_SIZE);

    const presignedUrls: string[] = [];

    for (let i = 0; i < numberOfParts; i++) {
      const presignedUrl = await getSignedUrl(
        this.s3Client,
        new UploadPartCommand({
          Bucket: this.s3Bucket,
          Key: key,
          UploadId: multipartUploadId,
          PartNumber: i + 1,
          // ChecksumAlgorithm:
          //   process.env.NODE_ENV === "development" ? "SHA256" : undefined,
        }),
        {
          expiresIn: 3600,
          // unhoistableHeaders:
          //   process.env.NODE_ENV === "development"
          //     ? new Set(["x-amz-checksum-sha256"])
          //     : undefined,
        }
      );

      presignedUrls.push(presignedUrl);
    }

    return presignedUrls;
  }
}
