import Elysia, { t } from 'elysia';
import { authMiddleware } from 'mys-server/src/infra/elysiajs/http/middlewares/auth';
import { database } from '@/infra/database';
import { uploadsTable } from '@/infra/database/schemas/uploads';
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  not,
  or,
  sql,
} from 'drizzle-orm';
import { NotFoundError } from '../../app/errors/not-found';
import { transcodersTable } from '@/infra/database/schemas/transcoders';
import { mediasTable, mediaStatus } from '@/infra/database/schemas/medias';
import { signJWTToken, verifyJWTToken } from '@/infra/lib/jwt';
import { BadRequestError } from '../../app/errors/bad-request';
import { releaseTranscoderJob } from 'mys-server/src/infra/elysiajs/http/services/transcoder';
import { decrypt, encrypt } from '@/infra/lib/encryption';
import { storagesTable } from '@/infra/database/schemas/storages';
import { getUserPermissions } from '@/infra/v1/app/auth';
import { UnauthorizedError } from '../../app/errors/unauthorized';
import {
  calculateSize,
  deleteObject,
  generateGetPresignedUrl,
  generateGetPresignedUrlWithRange,
  getObject,
  getObjectUrl,
} from 'mys-server/src/infra/elysiajs/http/services/storage';
import { playbacksTable } from '@/infra/database/schemas/playbacks';
import { env } from '@/config/env';
import { addDays, addHours, addSeconds, isAfter, isBefore } from 'date-fns';
import { usersTable } from '@/infra/database/schemas/users';
import { profilesTable } from '@/infra/database/schemas/profiles';
import { titlesTable } from '@/infra/database/schemas/titles';
import { mediaAssignsTable } from '@/infra/database/schemas/media-assigns';
import { episodesTable } from '@/infra/database/schemas/episodes';
import { seasonsTable } from '@/infra/database/schemas/seasons';
// import { playbacksRoutes } from "./playbacks";
import { MediaService } from '@/infra/v1/app/services/media-service';

export const privateRoutes = new Elysia({})
  .use(authMiddleware)

  .post(
    '/',
    async ({ body, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('create', 'Media')) throw new UnauthorizedError();

      const { media } = await MediaService.create({
        uploadId: body.uploadId,
        autoEncode: body.autoEncode ?? true,
      });

      return media;
    },

    {
      body: t.Object({
        uploadId: t.String(),
        autoEncode: t.Optional(t.Boolean()),
      }),
    },
  )
  .get(
    '/',
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Media')) throw new UnauthorizedError();

      const result = await MediaService.findWithPagination(query);

      return result;
    },
    {
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
      }),
    },
  )
  .get(
    '/:mediaId',
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Media')) throw new UnauthorizedError();

      const { media } = await MediaService.findById(params.mediaId);

      return media;
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
    },
  )

  .delete(
    '/:mediaId',
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('delete', 'Media')) throw new UnauthorizedError();

      await MediaService.deleteById(params.mediaId);

      return { success: true };
    },
    {
      params: t.Object({ mediaId: t.String() }),
    },
  )

  // Assigns, switch file

  .get(
    '/:mediaId/assigns',
    async ({ user, params, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Media')) throw new UnauthorizedError();

      const media = await database
        .select({
          id: mediasTable.id,

          updatedAt: mediasTable.updatedAt,
          createdAt: mediasTable.createdAt,
        })
        .from(mediasTable)

        .where(eq(mediasTable.id, params.mediaId))
        .limit(1)
        .then((res) => res[0]);

      if (!media) throw new NotFoundError('Media not found');

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(
        mediaAssignsTable,
        eq(mediaAssignsTable.mediaId, params.mediaId),
      );
      const totalPages = Math.ceil(totalCount / pageSize);

      const mediaAssigns = await database
        .select({
          mediaId: mediaAssignsTable.mediaId,
          titleId: mediaAssignsTable.titleId,

          assignedAt: mediaAssignsTable.assignedAt,

          assignedBy: {
            id: usersTable.id,
            username: usersTable.username,
            email: usersTable.email,
          },

          title: {
            id: titlesTable.id,
            name: titlesTable.name,
            tagline: titlesTable.tagline,
          },

          episode: {
            id: episodesTable.id,
            name: episodesTable.name,
            number: episodesTable.number,
            airDate: episodesTable.airDate,
          },

          userProfile: {
            id: profilesTable.id,
            nickname: profilesTable.nickname,
            avatar: profilesTable.avatar,
          },
        })
        .from(mediaAssignsTable)
        .where(eq(mediaAssignsTable.mediaId, params.mediaId))
        .leftJoin(titlesTable, eq(titlesTable.id, mediaAssignsTable.titleId))
        .leftJoin(
          episodesTable,
          eq(episodesTable.id, mediaAssignsTable.episodeId),
        )
        .leftJoin(usersTable, eq(usersTable.id, mediaAssignsTable.assignedBy))
        .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
        .orderBy(desc(mediaAssignsTable.assignedAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: mediaAssigns.map((assign) => ({
          ...assign,
          assignedBy: {
            ...assign.assignedBy,
            profile: assign.userProfile
              ? {
                  ...assign.userProfile,
                  avatarUrl: assign.userProfile.avatar
                    ? getObjectUrl(assign.userProfile.avatar)
                    : undefined,
                }
              : null,
          },
          userProfile: undefined,
        })),
        pagination: {
          size: pageSize,
          count: Math.floor(totalCount / pageSize),
          pages: totalPages,
        },
      };
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
      }),
    },
  )
  .put(
    '/:mediaId/assign',
    async ({ user, params, body }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Media')) throw new UnauthorizedError();

      const media = await database
        .select({
          id: mediasTable.id,
          key: mediasTable.key,

          name: mediasTable.name,

          thumbnailKey: mediasTable.thumbnailKey,

          updatedAt: mediasTable.updatedAt,
          createdAt: mediasTable.createdAt,
        })
        .from(mediasTable)

        .where(eq(mediasTable.id, params.mediaId))
        .limit(1)
        .then((res) => res[0]);

      if (!media) throw new NotFoundError('Media not found');

      const title = await database
        .select()
        .from(titlesTable)
        .where(eq(titlesTable.id, body.titleId))
        .limit(1)
        .then((r) => r[0]);

      if (title.type === 'TV_SHOW' && !body.episodeId)
        throw new BadRequestError('EpisodeId is invalid');

      if (title.type === 'TV_SHOW') {
        const episode = await database
          .select()
          .from(episodesTable)
          .where(eq(episodesTable.id, body.episodeId!))
          .limit(1)
          .then((r) => r[0]);

        if (!episode) throw new NotFoundError('Episode not found');

        const season = await database
          .select()
          .from(seasonsTable)
          .where(eq(seasonsTable.id, episode.seasonId!))
          .limit(1)
          .then((r) => r[0]);

        if (!season) throw new NotFoundError('Season not found');
        if (season.titleId !== title.id)
          throw new BadRequestError('Invalid episode');

        await database.insert(mediaAssignsTable).values({
          mediaId: media.id,
          titleId: title.id,
          assignedBy: user.id,
          episodeId: episode.id,
        });

        return { success: true };
      } else if (title.type === 'MOVIE') {
        await database.insert(mediaAssignsTable).values({
          mediaId: media.id,
          titleId: title.id,
          assignedBy: user.id,
        });

        return { success: true };
      }
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
      body: t.Object({
        titleId: t.String(),
        episodeId: t.Optional(t.String()),
      }),
    },
  );

export const mediasRoutes = new Elysia({ prefix: '/medias' })
  // .use(playbacksRoutes)
  .use(privateRoutes);

/*
  
  .post(
    "/:mediaId/done",
    async ({ body }) => {
      const tokenData = await verifyJWTToken<{ mediaId: string }>(body.token);
      console.log(tokenData);

      if (!tokenData) throw new BadRequestError("Invalid token");

      const media = await database
        .select({
          id: mediasTable.id,

          upload: {
            id: uploadsTable.id,
            key: uploadsTable.key,
            storageId: uploadsTable.storageId,
          },

          storage: {
            id: storagesTable.id,
            region: storagesTable.region,
            endpoint: storagesTable.endpoint,
            accessKeyId: storagesTable.accessKeyId,
            secretAccessKey: storagesTable.secretAccessKey,
            bucket: storagesTable.bucket,
          },
        })
        .from(mediasTable)
        .where(eq(mediasTable.id, tokenData.mediaId))
        .limit(1)
        .innerJoin(
          uploadsTable,
          eq(mediasTable.originUploadId, uploadsTable.id)
        )
        .innerJoin(storagesTable, eq(mediasTable.storageId, storagesTable.id))
        .then((res) => res[0]);

      if (!media) throw new NotFoundError("Media not found");
      if (!media.storage)
        throw new NotFoundError("Storage not found in upload");

      const size = await calculateSize(
        { key: body.data.key },
        {
          bucket: media.storage.bucket,
          region: media.storage.region,
          endpoint: media.storage.endpoint || undefined,
          accessKeyId: decrypt(media.storage.accessKeyId!),
          secretAccessKey: decrypt(media.storage.secretAccessKey!),
        }
      );

      await database
        .update(mediasTable)
        .set({
          size,
          status: "AVAILABLE",
          encryptionKey: encrypt(body.data.encryption.keyId),
          encryptionValue: encrypt(body.data.encryption.keyValue),
          origin: body.data.origin,
          type: body.data.type,
          key: body.data.key,
          manifestKey: body.data.manifestKey,
          thumbnailKey: body.data.thumbnailKey,
          previewsKey: body.data.previewsKey,
          duration: body.data.duration,
          processingEndedAt: new Date(),
        })
        .where(eq(mediasTable.id, media.id));

      return { success: true };
    },
    {
      params: t.Object({ mediaId: t.String() }),
      body: t.Object({
        token: t.String(),
        data: t.Object({
          key: t.String(),
          manifestKey: t.String(),
          encryption: t.Object({
            keyId: t.String(),
            keyValue: t.String(),
          }),
          origin: t.Union([t.Literal("SHAKA-PACKAGER")]),
          type: t.Union([t.Literal("DASH"), t.Literal("HLS")]),
          streams: t.Array(t.Any()),
          thumbnailKey: t.Optional(t.String()),
          previewsKey: t.Optional(t.String()),
          duration: t.Optional(t.Numeric()),
        }),
      }),
    }
  )
  .get(
    "/:mediaId/manifest",
    async ({ query }) => {
      const tokenData = await verifyJWTToken<{ mediaId: string }>(query.token);

      if (!tokenData) throw new BadRequestError("Invalid token");

      const media = await database
        .select({
          id: mediasTable.id,
          storageId: mediasTable.storageId,

          upload: {
            id: uploadsTable.id,
            key: uploadsTable.key,
            storageId: uploadsTable.storageId,
          },
        })
        .from(mediasTable)
        .where(eq(mediasTable.id, tokenData.mediaId))
        .limit(1)
        .innerJoin(
          uploadsTable,
          eq(mediasTable.originUploadId, uploadsTable.id)
        )
        .then((res) => res[0]);

      if (!media) throw new NotFoundError("Media not found");
      if (!media.storageId)
        throw new NotFoundError("Storage not found in upload");

      const storage = await database
        .select({
          id: storagesTable.id,
          accessKeyId: storagesTable.accessKeyId,
          secretAccessKey: storagesTable.secretAccessKey,
          region: storagesTable.region,
          bucket: storagesTable.bucket,
          endpoint: storagesTable.endpoint,
        })
        .from(storagesTable)
        .where(eq(storagesTable.id, media.storageId))
        .limit(1)
        .then((res) => res[0]);

      if (!storage) throw new NotFoundError("Storage not found");

      await database
        .update(mediasTable)
        .set({ status: "PROCESSING", processingStartedAt: new Date() })
        .where(eq(mediasTable.id, media.id));

      return {
        OBJECT_KEY: media.upload.key,
        AWS_REGION: storage.region,
        BUCKET: storage.bucket,
        AWS_ACCESS_KEY_ID: decrypt(storage.accessKeyId),
        AWS_SECRET_ACCESS_KEY: decrypt(storage.secretAccessKey),
        AWS_ENDPOINT: storage.endpoint,
      };
    },
    {
      params: t.Object({
        mediaId: t.String(),
      }),
      query: t.Object({
        token: t.String(),
      }),
    }
  )
  */
