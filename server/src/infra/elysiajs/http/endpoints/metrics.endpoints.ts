import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { MetricsUseCase } from "@/app/use-cases/metrics/metrics.use-case";
import { DrizzleStorageMetricsRepository } from "../../database/repositories/drizzle.storage-metrics.repository";
import { database } from "../../database";
import { DrizzlePlaybacksRepository } from "../../database/repositories/drizzle.playbacks.repository";
import { DrizzleEncodesRepository } from "../../database/repositories/drizzle.encodes.repository";
import { DrizzleUploadsRepository } from "../../database/repositories/drizzle.uploads.repository";

const storageMetricsRepository = new DrizzleStorageMetricsRepository(database);
const playbacksRepository = new DrizzlePlaybacksRepository(database);
const encodesRepository = new DrizzleEncodesRepository(database);
const uploadsRepository = new DrizzleUploadsRepository(database);

const metricsUseCase = new MetricsUseCase(
  storageMetricsRepository,
  playbacksRepository,
  encodesRepository,
  uploadsRepository
);

const mediaCenterMetrics = new Elysia({ prefix: "/media-center" })
  .get(
    "/",
    async ({ query }) => {
      const metric = await metricsUseCase.getMediaCenterMetric({
        from: query.from,
        to: query.to,
        type: query.type,
      });

      return metric;
    },
    {
      query: t.Object({
        from: t.Date(),
        to: t.Date(),
        type: t.Union([
          t.Literal("TOTAL_STORAGE"),
          t.Literal("TOTAL_BANDWIDTH"),
          t.Literal("TOTAL_PLAYBACKS"),
          t.Literal("TOTAL_UPLOADS"),
        ]),
      }),
    }
  )
  .get(
    "/charts",
    async ({ query }) => {
      const chart = await metricsUseCase.getChart({
        from: query.from,
        to: query.to,
        type: query.type,
      });

      return chart;
    },
    {
      query: t.Object({
        from: t.Date(),
        to: t.Date(),
        type: t.Union([
          t.Literal("ENCODES"),
          t.Literal("UPLOADS"),
          // t.Literal("TOTAL_BANDWIDTH"),
          // t.Literal("TOTAL_PLAYBACKS"),
        ]),
      }),
    }
  );

export const MetricsEndpoints = new Elysia({ prefix: "/metrics" })
  .use(authMiddleware)
  .use(mediaCenterMetrics);
