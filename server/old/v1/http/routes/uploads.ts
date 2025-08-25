import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { getUserPermissions } from "@/infra/v1/app/auth";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import { database } from "@/infra/database";
import { storagesTable } from "@/infra/database/schemas/storages";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../../../../app/errors/not-found";
import { uploadsTable } from "@/infra/database/schemas/uploads";
import {
  completeMultipartUpload,
  createUpload,
  deleteObject,
  generatePresignedUrls,
} from "../services/storage";
import { generateUUID } from "@/infra/lib/uuid";
import { decrypt } from "@/infra/lib/encryption";

export const uploadsRoutes = new Elysia({ prefix: "/uploads" })
  .use(authMiddleware)
  .post(
    "/:uploadId/complete",
    async ({ user, params, body }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("update", "Upload")) throw new UnauthorizedError();

      const upload = await database
        .select({
          id: uploadsTable.id,

          key: uploadsTable.key,
          status: uploadsTable.status,
          size: uploadsTable.size,
          multipartUploadId: uploadsTable.multipartUploadId,
          createdAt: uploadsTable.createdAt,

          storage: {
            id: storagesTable.id,
            bucket: storagesTable.bucket,
            region: storagesTable.region,
            accessKeyId: storagesTable.accessKeyId,
            secretAccessKey: storagesTable.secretAccessKey,
            endpoint: storagesTable.endpoint,
          },
        })
        .from(uploadsTable)
        .where(eq(uploadsTable.id, params.uploadId))
        .innerJoin(storagesTable, eq(storagesTable.id, uploadsTable.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!upload) throw new NotFoundError("Upload not found");

      await completeMultipartUpload(
        {
          key: upload.key!,
          parts: body.parts,
          uploadId: upload.multipartUploadId!,
        },
        {
          accessKeyId: decrypt(upload.storage.accessKeyId),
          secretAccessKey: decrypt(upload.storage.secretAccessKey),
          bucket: upload.storage.bucket,
          region: upload.storage.region,
          endpoint: upload.storage.endpoint || undefined,
        }
      );

      await database
        .update(uploadsTable)
        .set({ status: "COMPLETED" })
        .where(eq(uploadsTable.id, upload.id));

      return { success: true };
    },
    {
      params: t.Object({ uploadId: t.String() }),
      body: t.Object({
        parts: t.Array(
          t.Object({
            ETag: t.String(),
            PartNumber: t.Numeric(),
          })
        ),
      }),
    }
  )
  .get(
    "/:uploadId/presigned",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("update", "Upload")) throw new UnauthorizedError();

      const upload = await database
        .select({
          id: uploadsTable.id,

          key: uploadsTable.key,
          status: uploadsTable.status,
          size: uploadsTable.size,
          multipartUploadId: uploadsTable.multipartUploadId,
          createdAt: uploadsTable.createdAt,

          storage: {
            id: storagesTable.id,
            bucket: storagesTable.bucket,
            region: storagesTable.region,
            accessKeyId: storagesTable.accessKeyId,
            secretAccessKey: storagesTable.secretAccessKey,
            endpoint: storagesTable.endpoint,
          },
        })
        .from(uploadsTable)
        .where(eq(uploadsTable.id, params.uploadId))
        .innerJoin(storagesTable, eq(storagesTable.id, uploadsTable.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!upload) throw new NotFoundError("Upload not found");

      await database
        .update(uploadsTable)
        .set({ status: "UPLOADING" })
        .where(eq(uploadsTable.id, upload.id));

      const { presignedUrls } = await generatePresignedUrls(
        {
          key: upload.key!,
          size: upload.size!,
          uploadId: upload.multipartUploadId!,
        },
        {
          accessKeyId: decrypt(upload.storage.accessKeyId),
          secretAccessKey: decrypt(upload.storage.secretAccessKey),
          bucket: upload.storage.bucket,
          region: upload.storage.region,
          endpoint: upload.storage.endpoint || undefined,
        }
      );

      return presignedUrls;
    },
    {
      params: t.Object({ uploadId: t.String() }),
    }
  )
  .post(
    "/",
    async ({ user, body }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("create", "Upload")) throw new UnauthorizedError();

      const storage = await database
        .select({
          id: storagesTable.id,
          bucket: storagesTable.bucket,
          region: storagesTable.region,
          accessKeyId: storagesTable.accessKeyId,
          secretAccessKey: storagesTable.secretAccessKey,
          endpoint: storagesTable.endpoint,
        })
        .from(storagesTable)
        .where(eq(storagesTable.id, body.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!storage) throw new NotFoundError("Storage not found");

      const key = `uploads/${generateUUID()}`;

      const { uploadId: multipartUploadId } = await createUpload(
        { key, type: body.type },
        {
          accessKeyId: decrypt(storage.accessKeyId),
          secretAccessKey: decrypt(storage.secretAccessKey),
          bucket: storage.bucket,
          region: storage.region,
          endpoint: storage.endpoint || undefined,
        }
      );

      const upload = await database
        .insert(uploadsTable)
        .values({
          key,
          originalName: body.name,
          size: body.size,
          status: "CREATED",
          type: body.type,
          storageId: storage.id,
          multipartUploadId: multipartUploadId,
        })
        .returning({
          id: uploadsTable.id,
          key: uploadsTable.key,
          status: uploadsTable.status,
          createdAt: uploadsTable.createdAt,
        })
        .then((res) => res[0]);

      return upload;
    },
    {
      body: t.Object({
        storageId: t.String(),
        name: t.String(),
        size: t.Numeric(),
        type: t.String(),
      }),
    }
  )
  .get(
    "/",
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Upload")) throw new UnauthorizedError();

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(storagesTable);
      const totalPages = Math.ceil(totalCount / pageSize);

      const uploads = await database
        .select({
          id: uploadsTable.id,
          key: uploadsTable.key,
          originalName: uploadsTable.originalName,
          size: uploadsTable.size,
          type: uploadsTable.type,
          status: uploadsTable.status,
          createdAt: uploadsTable.createdAt,
          storage: {
            id: storagesTable.id,
            bucket: storagesTable.bucket,
          },
        })
        .from(uploadsTable)
        .leftJoin(storagesTable, eq(storagesTable.id, uploadsTable.storageId))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: uploads,
        pagination: {
          size: pageSize,
          count: totalCount / pageSize,
          pages: totalPages,
        },
      };
    },
    {
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
      }),
    }
  )
  .get(
    "/:uploadId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Upload")) throw new UnauthorizedError();

      const upload = await database
        .select({
          id: uploadsTable.id,
          key: uploadsTable.key,
          originalName: uploadsTable.originalName,
          size: uploadsTable.size,
          type: uploadsTable.type,
          status: uploadsTable.status,
          createdAt: uploadsTable.createdAt,
          storage: {
            id: storagesTable.id,
            bucket: storagesTable.bucket,
          },
        })
        .from(uploadsTable)
        .leftJoin(storagesTable, eq(storagesTable.id, uploadsTable.storageId))
        .where(eq(uploadsTable.id, params.uploadId))
        .limit(1)
        .then((r) => r[0]);

      if (!upload) throw new NotFoundError("Upload not found");

      return upload;
    },
    {
      params: t.Object({
        uploadId: t.String(),
      }),
    }
  )
  .delete(
    "/:uploadId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("delete", "Upload")) throw new UnauthorizedError();

      const upload = await database
        .select({
          id: uploadsTable.id,

          key: uploadsTable.key,
          status: uploadsTable.status,
          size: uploadsTable.size,
          multipartUploadId: uploadsTable.multipartUploadId,
          createdAt: uploadsTable.createdAt,

          storage: {
            id: storagesTable.id,
            bucket: storagesTable.bucket,
            region: storagesTable.region,
            accessKeyId: storagesTable.accessKeyId,
            secretAccessKey: storagesTable.secretAccessKey,
            endpoint: storagesTable.endpoint,
          },
        })
        .from(uploadsTable)
        .where(eq(uploadsTable.id, params.uploadId))
        .innerJoin(storagesTable, eq(storagesTable.id, uploadsTable.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!upload) throw new NotFoundError("Upload not found");

      const credentials = {
        accessKeyId: decrypt(upload.storage.accessKeyId),
        secretAccessKey: decrypt(upload.storage.secretAccessKey),
        bucket: upload.storage.bucket,
        region: upload.storage.region,
        endpoint: upload.storage.endpoint || undefined,
      };

      await deleteObject({ key: upload.key! }, credentials);

      await database.delete(uploadsTable).where(eq(uploadsTable.id, upload.id));

      return { success: true };
    },
    {
      params: t.Object({ uploadId: t.String() }),
    }
  );
