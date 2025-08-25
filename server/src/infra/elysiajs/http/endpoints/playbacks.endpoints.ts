import { PlaybacksUseCase } from "@/app/use-cases/playbacks/playbacks.use-case";
import Elysia, { t } from "elysia";
import { DrizzlePlaybacksRepository } from "../../database/repositories/drizzle.playbacks.repository";
import { database } from "../../database";
import { DrizzleMediasRepository } from "../../database/repositories/drizzle.medias.repository";
import { S3Service } from "../../services/s3.service";
import { JWTService } from "../../services/jwt.service";
import { authMiddleware } from "../middlewares/auth";
import { env } from "@/config/env";
import { DrizzleEncodesRepository } from "../../database/repositories/drizzle.encodes.repository";
import { StorageMetricsUseCase } from "@/app/use-cases/storage-metrics/storage-metrics.use-case";
import { DrizzleStorageMetricsRepository } from "../../database/repositories/drizzle.storage-metrics.repository";

const playbacksRepository = new DrizzlePlaybacksRepository(database);
const mediasRepository = new DrizzleMediasRepository(database);
const encodesRepository = new DrizzleEncodesRepository(database);
const storageMetricsRepository = new DrizzleStorageMetricsRepository(database);

const s3Service = new S3Service();
const jwtService = new JWTService();

const storageMetricsUseCase = new StorageMetricsUseCase(
  storageMetricsRepository
);
const playbacksUseCase = new PlaybacksUseCase(
  playbacksRepository,
  mediasRepository,
  encodesRepository,
  jwtService,
  s3Service,
  storageMetricsUseCase
);

const privateRoutes = new Elysia({}).use(authMiddleware).post(
  "/",
  async ({ body: { mediaId }, user }) => {
    // endpoints: {
    //   manifest: string;
    //   encryption: string;
    //   keepAlive: string;
    // };
    // keepAliveIn: number;

    const result = await playbacksUseCase.create(
      { mediaId },
      user.id.toValue()
    );

    const baseUrl = `${env.HOST_URL}/v1/playbacks`;

    return {
      token: result.token,
      endpoints: {
        manifest: `${baseUrl}/manifest`,
        encryption: `${baseUrl}/encryption`,
        keepAlive: `${baseUrl}/keep-alive`,
      },
      keepAliveIn: 15,
    };
  },
  {
    body: t.Object({
      mediaId: t.String(),
    }),
  }
);

const publicRoutes = new Elysia()
  .get(
    "/manifest",
    async ({ query: { token }, set }) => {
      console.log(token);

      const manifest = await playbacksUseCase.getManifestByToken(token);

      set.headers["content-type"] = "application/dash+xml";

      return manifest;
    },
    {
      query: t.Object({
        token: t.String(),
      }),
    }
  )
  .head("/manifest", () => true)
  .get(
    "/representation",
    async ({ query: { key, token }, redirect, headers }) => {
      const range = headers["range"]?.replaceAll("bytes=", "");

      const url = await playbacksUseCase.getRepresentationByToken(
        token,
        key,
        range
      );

      return redirect(url);
    },
    {
      query: t.Object({
        token: t.String(),
        key: t.String(),
      }),
    }
  )
  .get(
    "/encryption",
    async ({ query: { token } }) => {
      const encryptionData = await playbacksUseCase.getEncryptionByToken(token);

      return encryptionData;
    },
    {
      query: t.Object({
        token: t.String(),
      }),
    }
  )
  .get(
    "/previews",
    async ({ query: { token } }) => {
      const previews = await playbacksUseCase.getPreviewsByToken(token);

      return previews;
    },
    {
      query: t.Object({
        token: t.String(),
      }),
    }
  )
  .post(
    "/keep-alive",
    async ({ body: { token, currentTime } }) => {
      const result = await playbacksUseCase.keepAlive(token, {
        currentTime,
      });

      return result;
    },
    {
      body: t.Object({
        currentTime: t.Optional(t.Number()),
        token: t.String(),
      }),
    }
  );

export const PlaybacksEndpoints = new Elysia({
  prefix: "/playbacks",
})
  .use(publicRoutes)
  .use(privateRoutes);
