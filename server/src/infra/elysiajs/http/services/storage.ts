import { env } from "@/config/env";
import { generateUUID } from "@/infra/lib/uuid";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetBucketAclCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  type ObjectCannedACL,
  type StorageClass,
} from "@aws-sdk/client-s3";
import { extname } from "path";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
});

type S3Bucket = {
  name: string;
  region: string;
  createdAt: Date;
};

const Bucket = env.S3_BUCKET;

const PART_SIZE = 10000000;

export const uploadFile = async (
  file: File,
  path?: string
): Promise<string> => {
  let objectPath = path;

  if (path?.endsWith("/")) {
    objectPath = `${path}${generateUUID()}${extname(file.name)}`;
  } else if (!path) {
    objectPath = `${generateUUID()}${extname(file.name)}`;
  } else {
    objectPath = path;
  }

  // await s3Client.write(objectPath, file, { type: file.type });

  return objectPath;
};

export const uploadArrayBuffer = async (
  data: ArrayBuffer,
  path: string,
  type?: string
): Promise<string> => {
  let objectPath = path;

  // await s3Client.write(objectPath, data, { type });

  return objectPath;
};

export const generatePutPresignedUrl = async (
  key: string,
  options?: {
    length?: number;
    type?: string;
    acl?: ObjectCannedACL;
  }
) => {
  const command = new PutObjectCommand({
    Key: key,
    // ContentType: type,
    ContentLength: options?.length,
    ContentType: options?.type,
    ACL: options?.acl,
    Bucket,
    Metadata: {
      "Cache-Control": "max-age=2592000,public",
    },
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const getObjectUrl = (key: string) => {
  return `https://s3.${env.S3_REGION}.amazonaws.com/${env.S3_BUCKET}/${key}`;
  // return s3Client
  //   .presign(path, {
  //     acl: "public-read",
  //     expiresIn: 3600 * 4,
  //   })
  //   .replaceAll("172.17.0.1", "localhost");
};

export const generateGetPresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Key: key,
    Bucket,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  // return s3Client
  //   .presign(path, {
  //     acl: "public-read",
  //     expiresIn: 3600 * 4,
  //   })
  //   .replaceAll("172.17.0.1", "localhost");
};

export const validateStorage = async (
  region: string,
  bucket: string,
  accessKeyId: string,
  secretAccessKey: string,
  endpoint?: string
): Promise<boolean> => {
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint,
    forcePathStyle: true,
  });

  const command = new GetBucketAclCommand({ Bucket: bucket });

  const response = await s3Client.send(command).then(() => true);
  // .catch(() => false);

  return response;
};

export const getBuckets = async (
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  endpoint?: string
) => {
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    endpoint,
    forcePathStyle: true,
  });

  const command = new ListBucketsCommand();

  const response = await s3Client.send(command);
  // .catch(() => false);

  return response.Buckets?.map(
    (bucket) =>
      ({
        name: bucket.Name!,
        region: bucket.BucketRegion!,
        createdAt: bucket.CreationDate!,
      } satisfies S3Bucket)
  );
};

export const createUpload = async (
  object: { key: string; type?: string; class?: StorageClass },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });

  const createMultipartUploadCommand = new CreateMultipartUploadCommand({
    Bucket: storage.bucket,
    Key: object.key,
    ACL: "private",
    ContentType: object.type || "video/x-matroska",
    StorageClass: object.class,
  });

  const startUploadResponse = await s3Client.send(createMultipartUploadCommand);

  const uploadId = startUploadResponse.UploadId;

  if (!uploadId) throw new Error("Unable to create upload");

  return { uploadId };
};

export const generatePresignedUrls = async (
  object: { key: string; uploadId: string; size: number },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });
  const numberOfParts = Math.ceil(object.size / PART_SIZE);

  const presignedUrls: string[] = [];

  for (let i = 0; i < numberOfParts; i++) {
    const presignedUrl = await getSignedUrl(
      s3Client,
      new UploadPartCommand({
        Bucket: storage.bucket,
        Key: object.key,
        UploadId: object.uploadId,
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

  return { presignedUrls };
};

export const completeMultipartUpload = async (
  object: {
    key: string;
    uploadId: string;
    parts: { ETag: string; PartNumber: number }[];
  },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });

  const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
    Key: object.key,
    Bucket: storage.bucket,
    UploadId: object.uploadId,

    MultipartUpload: {
      Parts: object.parts,
    },
  });

  await s3Client.send(completeMultipartUploadCommand);
};

export const calculateSize = async (
  object: { key: string },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });
  let length = 0;

  const recursiveCheck = async (token?: string) => {
    // get the files
    const listCommand = new ListObjectsV2Command({
      Bucket: storage.bucket,
      Prefix: object.key,
      ContinuationToken: token,
    });
    const list = await client.send(listCommand);
    if (list && list.Contents && list.KeyCount) {
      // if items to delete
      // delete the files
      list.Contents.map((item) => {
        if (!item.Size) return;

        length += item.Size;

        return item.Size;
      });
    }
    // repeat if more files to delete
    if (list.NextContinuationToken) {
      await recursiveCheck(list.NextContinuationToken);
    }

    return true;
  };

  await recursiveCheck();

  return length;
};

export const deleteObject = async (
  object: { key: string },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
): Promise<number> => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });

  const bucket = storage.bucket;
  let count = 0;

  const recursiveDelete = async (token?: string) => {
    // get the files
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: object.key,
      ContinuationToken: token,
    });
    const list = await s3Client.send(listCommand);
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
      const deleted = await s3Client.send(deleteCommand);
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
};

export const getObject = async (
  object: { key: string; range?: string },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });

  const getCommand = new GetObjectCommand({
    Bucket: storage.bucket,
    Key: object.key,
    Range: object.range ? "bytes=" + object.range : undefined,
  });

  const response = await s3Client.send(getCommand);

  if (!response.Body) throw new Error("Body not found");

  return {
    body: await response.Body.transformToByteArray(),
    range: response.ContentRange as string,
    length: response.ContentLength,
  };
};

export const generateGetPresignedUrlWithRange = async (
  object: { key: string; range?: string },
  storage: {
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }
) => {
  const s3Client = new S3Client({
    region: storage.region,
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
  });

  const getCommand = new GetObjectCommand({
    Bucket: storage.bucket,
    Key: object.key,
    Range: object.range ? "bytes=" + object.range : undefined,
    // ResponseCacheControl: 'public, max-age=604800, immutable',
  });

  return await getSignedUrl(s3Client, getCommand);
};
