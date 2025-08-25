import Elysia, { t } from "elysia";

import { UploadsUseCases } from "@/app/use-cases/uploads/uploads.use-case";
import { S3Service } from "@/infra/elysiajs/services/s3.service";
import { DrizzleUploadsRepository } from "@/infra/elysiajs/database/repositories/drizzle.uploads.repository";
import { authMiddleware } from "../middlewares/auth";
import { database } from "@/infra/elysiajs/database";
import { UploadsPresenter } from "../presenters/uploads-presenter";
import { DrizzleStorageMetricsRepository } from "@/infra/elysiajs/database/repositories/drizzle.storage-metrics.repository";
import { StorageMetricsUseCase } from "@/app/use-cases/storage-metrics/storage-metrics.use-case";

const s3Service = new S3Service();

const uploadsRepository = new DrizzleUploadsRepository(database);
const storageMetricsRepository = new DrizzleStorageMetricsRepository(database);

const storageMetricsUseCase = new StorageMetricsUseCase(
  storageMetricsRepository
);
const uploadsUseCases = new UploadsUseCases(
  uploadsRepository,
  s3Service,
  storageMetricsUseCase
);

export const UploadsEndpoints = new Elysia({ prefix: "/uploads" })
  .use(authMiddleware)
  .post(
    "/:uploadId/complete",
    async ({ user, params, body }) => {
      // const { cannot }  = getUserPermissions(user.id, user.role);

      // if (cannot("update", "Upload")) throw new UnauthorizedError();

      await uploadsUseCases.complete(
        params.uploadId,
        body.parts,
        user.id.toValue()
      );

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
      query: t.Object({}),
    }
  )
  .get(
    "/:uploadId/presigned",
    async ({ user, params }) => {
      // const { cannot } = getUserPermissions(user.id, user.role);

      // if (cannot("update", "Upload")) throw new UnauthorizedError();

      const presignedUrls = await uploadsUseCases.presignedUrls(
        params.uploadId
      );

      return presignedUrls;
    },
    {
      params: t.Object({ uploadId: t.String() }),
      query: t.Object({}),
    }
  )
  .post(
    "/",
    async ({ user, body }) => {
      // const { cannot } = getUserPermissions(user.id, user.role);

      // if (cannot("create", "Upload")) throw new UnauthorizedError();

      const upload = await uploadsUseCases.create(body);

      return UploadsPresenter.toHttp(upload);
    },
    {
      body: t.Object({
        name: t.String(),
        size: t.Numeric(),
        type: t.String(),
      }),
      query: t.Object({}),
    }
  )
  .get(
    "/",
    async ({ user, query }) => {
      // const { cannot } = getUserPermissions(user.id, user.role);

      // if (cannot("get", "Upload")) throw new UnauthorizedError();

      const page = query.page;
      const pageSize = query.perPage || 10;

      const paginationResult = await uploadsUseCases.findWithPagination({
        page,
        perPage: pageSize,
      });

      return {
        data: paginationResult.data.map((upload) =>
          UploadsPresenter.toHttp(upload)
        ),
        pagination: paginationResult.pagination,
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
      // const { cannot } = getUserPermissions(user.id, user.role);

      // if (cannot("get", "Upload")) throw new UnauthorizedError();

      const upload = await uploadsUseCases.findById(params.uploadId);

      return UploadsPresenter.toHttp(upload);
    },
    {
      params: t.Object({
        uploadId: t.String(),
      }),
      query: t.Object({}),
    }
  )
  .delete(
    "/:uploadId",
    async ({ user, params }) => {
      // const { cannot } = getUserPermissions(user.id, user.role);

      // if (cannot("delete", "Upload")) throw new UnauthorizedError();

      await uploadsUseCases.deleteById(params.uploadId, user.id.toValue());

      return { success: true };
    },
    {
      params: t.Object({ uploadId: t.String() }),
      query: t.Object({}),
    }
  );
