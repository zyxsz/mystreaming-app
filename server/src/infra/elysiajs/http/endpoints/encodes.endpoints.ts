import { EncodesUseCase } from "@/app/use-cases/encodes/encodes.use-case";
import Elysia, { t } from "elysia";
import { DrizzleMediasRepository } from "../../database/repositories/drizzle.medias.repository";
import { DrizzleEncodesRepository } from "../../database/repositories/drizzle.encodes.repository";
import { LocalEncoderService } from "../../services/local-encoder.service";
import { CipherEncrypterService } from "../../services/cipher-encrypter.service";
import { database } from "../../database";
import type { HandleNotificationPayload } from "@/app/use-cases/encodes/encodes.dto";
import { DrizzleUploadsRepository } from "../../database/repositories/drizzle.uploads.repository";
import { authMiddleware } from "../middlewares/auth";
import { EncodesPresenter } from "../presenters/encodes.presenter";
import { DrizzleStorageMetricsRepository } from "../../database/repositories/drizzle.storage-metrics.repository";
import { StorageMetricsUseCase } from "@/app/use-cases/storage-metrics/storage-metrics.use-case";

// Dependencies

const mediasRepository = new DrizzleMediasRepository(database);
const encodesRepository = new DrizzleEncodesRepository(database);
const uploadsRepository = new DrizzleUploadsRepository(database);
const storageMetricsRepository = new DrizzleStorageMetricsRepository(database);

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

// Endpoints

const publicRoutes = new Elysia().post("/webhook", async ({ body }) => {
  console.log("Received encode webhook", body, typeof body);

  const result = encodesUseCase.handleNotification(
    JSON.parse(body as string) as HandleNotificationPayload
  );

  return result;
});

const privateRoutes = new Elysia().use(authMiddleware).get(
  "/",
  async ({ query }) => {
    const result = await encodesUseCase.findWithPagination({
      page: query.page,
      perPage: query.perPage || 50,
    });

    return {
      data: result.data.map((r) => EncodesPresenter.toHttp(r)),
      pagination: result.pagination,
    };
  },
  {
    query: t.Object({
      page: t.Number(),
      perPage: t.Optional(t.Number()),
    }),
  }
);

export const EncodesEndpoints = new Elysia({ prefix: "/encodes" })
  .use(publicRoutes)
  .use(privateRoutes);
