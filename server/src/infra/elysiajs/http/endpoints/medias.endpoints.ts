import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { MediasUseCase } from "@/app/use-cases/medias/medias.use-case";
import { DrizzleMediasRepository } from "../../database/repositories/drizzle.medias.repository";
import { database } from "../../database";
import { DrizzleStorageMetricsRepository } from "../../database/repositories/drizzle.storage-metrics.repository";
import { S3Service } from "../../services/s3.service";
import { StorageMetricsUseCase } from "@/app/use-cases/storage-metrics/storage-metrics.use-case";
import { MediasPresenter } from "../presenters/medias.presenter";
import { DrizzleEncodesRepository } from "../../database/repositories/drizzle.encodes.repository";
import { EncodesUseCase } from "@/app/use-cases/encodes/encodes.use-case";
import { DrizzleUploadsRepository } from "../../database/repositories/drizzle.uploads.repository";
import { LocalEncoderService } from "../../services/local-encoder.service";
import { CipherEncrypterService } from "../../services/cipher-encrypter.service";
import { DrizzlePlaybacksRepository } from "../../database/repositories/drizzle.playbacks.repository";
import { PlaybacksPresenter } from "../presenters/playbacks.presenter";
import { DrizzleMediaAssignsRepository } from "../../database/repositories/drizzle.media-assigns.repository";
import { MediaAssignPresenter } from "../presenters/media-assign-presenter";

const mediasRepository = new DrizzleMediasRepository(database);
const storageMetricsRepository = new DrizzleStorageMetricsRepository(database);
const encodesRepository = new DrizzleEncodesRepository(database);
const uploadsRepository = new DrizzleUploadsRepository(database);
const playbacksRepository = new DrizzlePlaybacksRepository(database);
const mediaAssignsRepository = new DrizzleMediaAssignsRepository(database);

const s3Service = new S3Service();
const localEncoderService = new LocalEncoderService();
const cipherEncrypterService = new CipherEncrypterService();

const storageMetricsUseCase = new StorageMetricsUseCase(
  storageMetricsRepository
);
const encodesUseCase = new EncodesUseCase(
  encodesRepository,
  mediasRepository,
  localEncoderService,
  cipherEncrypterService,
  uploadsRepository,
  storageMetricsUseCase
);

const mediasUseCase = new MediasUseCase(
  mediasRepository,
  playbacksRepository,
  encodesUseCase,
  uploadsRepository,
  mediaAssignsRepository
);

export const MediasEndpoints = new Elysia({
  prefix: "/medias",
})
  .use(authMiddleware)
  .get(
    "/",
    async ({ query }) => {
      const result = await mediasUseCase.findWithPagination({
        page: query.page,
        perPage: query.perPage || 15,
      });

      return {
        data: result.data.map((media) => MediasPresenter.toHttp(media)),
        pagination: result.pagination,
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
    "/:mediaId",
    async ({ params: { mediaId } }) => {
      const media = await mediasUseCase.findById(mediaId);

      return MediasPresenter.toHttp(media);
    },
    {
      params: t.Object({ mediaId: t.String() }),
      query: t.Object({}),
    }
  )
  .post(
    "/",
    async ({ body: { uploadId, name, autoEncode } }) => {
      const media = await mediasUseCase.create({ uploadId, autoEncode, name });

      return MediasPresenter.toHttp(media);
    },
    {
      body: t.Object({
        uploadId: t.String(),
        name: t.String({ maxLength: 256, minLength: 3 }),
        autoEncode: t.Optional(t.Boolean()),
      }),
      query: t.Object({}),
    }
  )
  .delete(
    "/:mediaId",
    async ({ params: { mediaId }, user }) => {
      await mediasUseCase.delete(mediaId, user.id.toString());

      return { success: true };
    },
    {
      params: t.Object({ mediaId: t.String() }),
      query: t.Object({}),
    }
  )
  .get(
    "/:mediaId/playbacks",
    async ({ params: { mediaId }, query }) => {
      const result = await mediasUseCase.findManyPlaybacksById(mediaId, {
        page: query.page,
        perPage: query.perPage || 25,
      });

      return {
        data: result.data.map((e) => PlaybacksPresenter.toHttp(e)),
        pagination: result.pagination,
      };
    },
    {
      params: t.Object({ mediaId: t.String() }),
      query: t.Object({ page: t.Number(), perPage: t.Optional(t.Number()) }),
    }
  )
  .get(
    "/:mediaId/assigns",
    async ({ params: { mediaId }, query }) => {
      const result = await mediasUseCase.findManyAssignsById(mediaId, {
        page: query.page,
        perPage: query.perPage || 25,
      });

      return {
        data: result.data.map((assign) => MediaAssignPresenter.toHttp(assign)),
        pagination: result.pagination,
      };
    },
    {
      params: t.Object({ mediaId: t.String() }),
      query: t.Object({ page: t.Number(), perPage: t.Optional(t.Number()) }),
    }
  )
  .post(
    "/:mediaId/assigns",
    async ({ params: { mediaId }, body, user }) => {
      const result = await mediasUseCase.assignMedia(mediaId, {
        titleId: body.titleId,
        episodeId: body.episodeId,
        userId: user.id.toString(),
      });

      return result;
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
      body: t.Object({
        titleId: t.String(),
        episodeId: t.Optional(t.String()),
      }),
      query: t.Object({}),
    }
  )
  .delete(
    "/:mediaId/assigns/:assignId",
    async ({ params: { mediaId, assignId }, user }) => {
      const result = await mediasUseCase.deleteAssign(mediaId, assignId);

      return result;
    },
    {
      params: t.Object({
        mediaId: t.String(),
        assignId: t.String(),
      }),
      query: t.Object({}),
    }
  );
