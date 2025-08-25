import type { StorageService } from "../../app/services/storage.service";
import fsPromise from "node:fs/promises";
import { mapLimit } from "async";
import path from "node:path";
import {
  GetObjectCommand,
  PutObjectCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  S3Client,
  UploadPartCommand,
  type CompleteMultipartUploadCommandInput,
  type CreateMultipartUploadCommandInput,
  type UploadPartCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "node:fs";

const oneMB = 1024 * 1024 * 10;
const maxSizeToMultipart = 1024 * 1024 * 5 * 10;

interface Credentials {
  STORAGE_BUCKET: string;
  STORAGE_ACCESS_KEY_ID?: string;
  STORAGE_SECRET_ACCESS_KEY?: string;
  STORAGE_ENDPOINT?: string;
}

export class S3Service implements StorageService {
  private BUCKET_NAME: string;
  private s3Client: S3Client;

  constructor(credentials?: Credentials) {
    this.BUCKET_NAME =
      credentials?.STORAGE_BUCKET || process.env.STORAGE_BUCKET!;
    this.s3Client = new S3Client({
      endpoint: credentials?.STORAGE_ENDPOINT,
      credentials: credentials
        ? {
            accessKeyId: credentials?.STORAGE_ACCESS_KEY_ID!,
            secretAccessKey: credentials?.STORAGE_ACCESS_KEY_ID!,
          }
        : undefined,
    });
  }

  async uploadDir(dirPath: string, objectKey: string): Promise<void> {
    async function getFiles(dir: string): Promise<string | string[]> {
      const d = await fsPromise.readdir(dir, { withFileTypes: true });
      const files = await Promise.all(
        d.map((dirent) => {
          const res = path.resolve(dir, dirent.name);
          return dirent.isDirectory() ? getFiles(res) : res;
        })
      );
      return Array.prototype.concat(...files);
    }

    const files = (await getFiles(dirPath)) as string[];

    await mapLimit(files, 10, async (filePath: any) => {
      if ((await fsPromise.stat(filePath)).size > maxSizeToMultipart) {
        console.log(
          `Uploading file ${path.relative(dirPath, filePath)}> with multipart...`
        );

        const upload = new Upload({
          client: this.s3Client,
          params: {
            Bucket: this.BUCKET_NAME,
            Key: `${objectKey}/${path.relative(dirPath, filePath)}`,
            ACL: "public-read",
            Body: fs.createReadStream(filePath),
          },
        });

        upload.on("httpUploadProgress", console.log);

        await upload.done();

        // await uploadMultiPartObject(
        //   s3Client,
        //   filePath,
        //   {
        //     Bucket: bucketName,
        //     ACL: "public-read",
        //     Key: `${playlistName}/${path.relative(key, filePath)}`,
        //   },
        //   path.relative(key, filePath)
        // );

        return true;
      }

      console.log(`Uploading file ${path.relative(dirPath, filePath)}...`);

      const putCommand = new PutObjectCommand({
        Key: `${objectKey}/${path.relative(dirPath, filePath)}`,
        Bucket: this.BUCKET_NAME,
        Body: await fsPromise.readFile(filePath),
        ACL: "public-read",
      });

      await this.s3Client.send(putCommand);

      return true;
    });

    return;
  }
}
