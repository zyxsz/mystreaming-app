import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { getUserPermissions } from "@/infra/v1/app/auth";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import {
  listTrancoderDefinitions,
  listTrancoderQueues,
} from "../services/transcoder";
import { NotFoundError } from "../../../../app/errors/not-found";
import { database } from "@/infra/database";
import { transcodersTable } from "@/infra/database/schemas/transcoders";
import { and, eq } from "drizzle-orm";
import { BadRequestError } from "../../../../app/errors/bad-request";
import { encrypt } from "@/infra/lib/encryption";

export const transcodersRoutes = new Elysia({ prefix: "/transcoders" })
  .use(authMiddleware)
  .get(
    "/details",
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Transcoder")) throw new UnauthorizedError();

      const credentials = {
        accessKeyId: query.accessKeyId.replace(
          "t",
          process.env.AWS_ACCESS_KEY_ID as string
        ),
        secretAccessKey: query.secretAccessKey.replace(
          "t",
          process.env.AWS_SECRET_ACCESS_KEY as string
        ),
        region: query.region,
        endpoint: query.endpoint,
      };

      const definitions = await listTrancoderDefinitions(credentials);
      const queues = await listTrancoderQueues(credentials);

      return { definitions, queues };
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
  .get(
    "/",
    async ({ user, query }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Transcoder")) throw new UnauthorizedError();

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(transcodersTable);
      const totalPages = Math.ceil(totalCount / pageSize);

      const transcoders = await database
        .select({
          id: transcodersTable.id,
          region: transcodersTable.region,
          jobDefinition: transcodersTable.jobDefinition,
          jobQueue: transcodersTable.jobQueue,
          createdAt: transcodersTable.createdAt,
        })
        .from(transcodersTable)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: transcoders,
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
    "/:transcoderId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Transcoder")) throw new UnauthorizedError();

      const transcoder = await database
        .select({
          id: transcodersTable.id,
          region: transcodersTable.region,
          jobDefinition: transcodersTable.jobDefinition,
          jobQueue: transcodersTable.jobQueue,
          createdAt: transcodersTable.createdAt,
        })
        .from(transcodersTable)
        .where(eq(transcodersTable.id, params.transcoderId))
        .limit(1)
        .then((r) => r[0]);

      if (!transcoder) throw new NotFoundError("Transcoder not found");

      return transcoder;
    },
    {
      params: t.Object({
        transcoderId: t.String(),
      }),
    }
  )
  .get(
    "/:transcoderId/logs",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Transcoder")) throw new UnauthorizedError();

      const transcoder = await database
        .select({
          id: transcodersTable.id,
          region: transcodersTable.region,
          jobDefinition: transcodersTable.jobDefinition,
          jobQueue: transcodersTable.jobQueue,
          createdAt: transcodersTable.createdAt,
        })
        .from(transcodersTable)
        .where(eq(transcodersTable.id, params.transcoderId))
        .limit(1)
        .then((r) => r[0]);

      if (!transcoder) throw new NotFoundError("Transcoder not found");

      return transcoder;
    },
    {
      params: t.Object({
        transcoderId: t.String(),
      }),
      query: t.Object({
        jobId: t.String(),
      }),
    }
  )
  .post(
    "/",
    async ({ user, body }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("get", "Transcoder")) throw new UnauthorizedError();

      const credentials = {
        accessKeyId: body.accessKeyId.replace(
          "t",
          process.env.AWS_ACCESS_KEY_ID as string
        ),
        secretAccessKey: body.secretAccessKey.replace(
          "t",
          process.env.AWS_SECRET_ACCESS_KEY as string
        ),
        region: body.region,
        endpoint: body.endpoint,
      };

      const definitions = await listTrancoderDefinitions(
        credentials,
        body.jobDefinition
      );
      const queues = await listTrancoderQueues(credentials, body.jobQueue);

      console.log(definitions);

      if (!definitions.find((d) => d.arn === body.jobDefinition))
        throw new NotFoundError("Definition not found");

      if (!queues.find((d) => d.arn === body.jobQueue))
        throw new NotFoundError("Queue not found");

      const transcoderAlreadyExists = await database
        .select()
        .from(transcodersTable)
        .where(
          and(
            eq(transcodersTable.jobDefinition, body.jobDefinition),
            eq(transcodersTable.jobQueue, body.jobQueue)
          )
        )
        .limit(1)
        .then((res) => res[0]);

      if (transcoderAlreadyExists)
        throw new BadRequestError("Transcoder already exists");

      const transcoder = await database
        .insert(transcodersTable)
        .values({
          accessKeyId: encrypt(credentials.accessKeyId),
          secretAccessKey: encrypt(credentials.secretAccessKey),
          region: credentials.region,
          jobDefinition: body.jobDefinition,
          jobQueue: body.jobQueue,
        })
        .returning({
          id: transcodersTable.id,
          region: transcodersTable.region,
          jobDefinition: transcodersTable.jobDefinition,
          jobQueue: transcodersTable.jobQueue,
          createdAt: transcodersTable.createdAt,
        });

      return transcoder;
    },
    {
      body: t.Object({
        jobQueue: t.String(),
        jobDefinition: t.String(),
        accessKeyId: t.String(),
        secretAccessKey: t.String(),
        region: t.String(),
        endpoint: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    "/:transcoderId",
    async ({ user, params }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot("delete", "Transcoder")) throw new UnauthorizedError();

      const transcoder = await database
        .select()
        .from(transcodersTable)
        .where(eq(transcodersTable.id, params.transcoderId))
        .limit(1)
        .then((res) => res[0]);

      if (!transcoder) throw new NotFoundError("Transcoder not found");

      await database
        .delete(transcodersTable)
        .where(eq(transcodersTable.id, transcoder.id));

      return { success: true };
    },
    {
      params: t.Object({
        transcoderId: t.String(),
      }),
    }
  );
