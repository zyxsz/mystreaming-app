import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { getUserPermissions } from "@/infra/v1/app/auth";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import { database } from "@/infra/database";
import { storagesTable } from "@/infra/database/schemas/storages";
import { and, eq, not, sql, sum } from "drizzle-orm";
import { BadRequestError } from "../../../../app/errors/bad-request";
import { deleteObject, getBuckets, validateStorage } from "../services/storage";
import { env } from "@/config/env";
import { decrypt, encrypt } from "@/infra/lib/encryption";
import { NotFoundError } from "../../../../app/errors/not-found";
import { uploadsTable } from "@/infra/database/schemas/uploads";
import { mapLimit } from "async";
import { mediasTable } from "@/infra/database/schemas/medias";

export const storagesRoutes = new Elysia({ prefix: "/storages" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Storage")) throw new UnauthorizedError();

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(storagesTable);
      const totalPages = Math.ceil(totalCount / pageSize);

      const storages = await database
        .select({
          id: storagesTable.id,
          bucket: storagesTable.bucket,
          region: storagesTable.region,
          endpoint: storagesTable.endpoint,
          createdAt: storagesTable.createdAt,
          totalSize: sum(uploadsTable.size),
        })
        .from(storagesTable)
        .groupBy(storagesTable.id)
        .leftJoin(uploadsTable, eq(uploadsTable.storageId, storagesTable.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: storages,
        pagination: {
          size: pageSize,
          count: totalCount,
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
    "/:storageId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Storage")) throw new UnauthorizedError();

      const storage = await database
        .select({
          id: storagesTable.id,
          bucket: storagesTable.bucket,
          region: storagesTable.region,
          endpoint: storagesTable.endpoint,
          updatedAt: storagesTable.updatedAt,
          createdAt: storagesTable.createdAt,
          totalSize: sum(uploadsTable.size),
        })
        .from(storagesTable)
        .groupBy(storagesTable.id)
        .leftJoin(uploadsTable, eq(uploadsTable.storageId, storagesTable.id))
        .limit(1)
        .then((r) => r[0]);

      if (!storage) throw new NotFoundError("Storage not found");

      return storage;
    },
    {
      params: t.Object({
        storageId: t.String(),
      }),
    }
  )
  .get(
    "/buckets",
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Storage")) throw new UnauthorizedError();

      const buckets = await getBuckets(
        query.region,

        query.accessKeyId.replace("t", process.env.AWS_ACCESS_KEY_ID as string),
        query.secretAccessKey.replace(
          "t",
          process.env.AWS_SECRET_ACCESS_KEY as string
        ),
        query.endpoint
      );

      return buckets;
    },
    {
      query: t.Object({
        accessKeyId: t.String(),
        secretAccessKey: t.String(),
        region: t.String(),
        endpoint: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/",
    async ({ user, body }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("create", "Storage")) throw new UnauthorizedError();

      const alreadyExistsStorage = await database
        .select()
        .from(storagesTable)
        .where(eq(sql`lower(${storagesTable.bucket})`, body.bucket.toString()))
        .limit(1)
        .then((res) => res[0]);

      if (alreadyExistsStorage)
        throw new BadRequestError("Storage already exists");

      const isStorageValid = await validateStorage(
        body.region,
        body.bucket,
        body.accessKeyId.replace("t", process.env.AWS_ACCESS_KEY_ID as string),
        body.secretAccessKey.replace(
          "t",
          process.env.AWS_SECRET_ACCESS_KEY as string
        ),
        body.endpoint
      );

      if (!isStorageValid) throw new BadRequestError("Storage is not valid");

      const storage = await database
        .insert(storagesTable)
        .values({
          accessKeyId: encrypt(
            body.accessKeyId.replace(
              "t",
              process.env.AWS_ACCESS_KEY_ID as string
            )
          ),
          secretAccessKey: encrypt(
            body.secretAccessKey.replace(
              "t",
              process.env.AWS_SECRET_ACCESS_KEY as string
            )
          ),
          bucket: body.bucket,
          region: body.region,
          endpoint: body.endpoint,
        })
        .returning({
          id: storagesTable.id,
          bucket: storagesTable.bucket,
          region: storagesTable.region,
          endpoint: storagesTable.endpoint,
          createdAt: storagesTable.createdAt,
        });

      return storage;
    },
    {
      body: t.Object({
        accessKeyId: t.String(),
        secretAccessKey: t.String(),
        region: t.String(),
        bucket: t.String(),
        endpoint: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    "/:storageId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("delete", "Storage")) throw new UnauthorizedError();

      const storage = await database
        .select()
        .from(storagesTable)
        .where(eq(storagesTable.id, params.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!storage) throw new NotFoundError("Storage not found");

      const uploads = await database
        .select()
        .from(uploadsTable)
        .where(
          and(
            eq(uploadsTable.storageId, storage.id),
            eq(uploadsTable.status, "COMPLETED")
          )
        );

      // const medias = await database
      // .select()
      // .from(mediasTable)
      // .where(
      //   and(
      //     // eq(mediasTable.storageId, storage.id),
      //     eq(mediasTable.status, "AVAILABLE")
      //   )
      // );

      const credentials = {
        accessKeyId: decrypt(storage.accessKeyId),
        secretAccessKey: decrypt(storage.secretAccessKey),
        bucket: storage.bucket,
        region: storage.region,
        endpoint: storage.endpoint || undefined,
      };

      const uploadsDeleted = (
        await mapLimit(uploads, 1, async (upload: (typeof uploads)[0]) => {
          if (!upload.key) return 0;

          return (await deleteObject({ key: upload.key }, credentials)) || 0;
        })
      ).reduce((a, b) => a + b, 0);

      await Promise.all([
        database
          .delete(uploadsTable)
          .where(
            and(
              eq(uploadsTable.storageId, storage.id),
              eq(uploadsTable.status, "COMPLETED")
            )
          ),
        database.delete(storagesTable).where(eq(storagesTable.id, storage.id)),
      ]);

      return { success: true, objectsDeleted: uploadsDeleted };
    },
    {
      params: t.Object({
        storageId: t.String(),
      }),
    }
  );
