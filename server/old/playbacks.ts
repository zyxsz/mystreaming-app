// import Elysia from "elysia";
// import { authMiddleware } from "../middlewares/auth";
// import { verifyJWTToken } from "@/lib/jwt";
// import { BadRequestError } from "@/v1/app/errors/bad-request";
// import { database } from "@/database";
// import { playbacksTable } from "@/database/schemas/playbacks";
// import { eq } from "drizzle-orm";
// import { NotFoundError } from "@/v1/app/errors/not-found";
// import { mediasTable } from "@/database/schemas/medias";
// import { storagesTable } from "@/database/schemas/storages";
// import { decrypt } from "@/lib/encryption";
// import { getObject } from "../services/storage";

// const publicRoutes = new Elysia({ prefix: "/:mediaId/playbacks" })
//   .get(
//     "/manifest",
//     async ({ query, set }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         query.token
//       );
//       console.log(tokenData);

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select()
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       const media = await database
//         .select({
//           id: mediasTable.id,
//           key: mediasTable.key,
//           manifestKey: mediasTable.manifestKey,
//           type: mediasTable.type,
//           storage: {
//             id: storagesTable.id,
//             region: storagesTable.region,
//             endpoint: storagesTable.endpoint,
//             accessKeyId: storagesTable.accessKeyId,
//             secretAccessKey: storagesTable.secretAccessKey,
//             bucket: storagesTable.bucket,
//           },
//         })
//         .from(mediasTable)
//         .where(eq(mediasTable.id, playback.mediaId!))
//         .limit(1)
//         .leftJoin(storagesTable, eq(mediasTable.storageId, storagesTable.id))
//         .then((res) => res[0]);

//       if (!media.storage)
//         throw new BadRequestError("Media's storage not found");
//       if (!media.manifestKey) throw new BadRequestError("Media is not ready");

//       const credentials = {
//         bucket: media.storage.bucket,
//         region: media.storage.region,
//         endpoint: media.storage.endpoint || undefined,
//         accessKeyId: decrypt(media.storage.accessKeyId!),
//         secretAccessKey: decrypt(media.storage.secretAccessKey!),
//       };

//       const manifest = await getObject({ key: media.manifestKey }, credentials);

//       if (media.type === "DASH") {
//         set.headers["content-type"] = "application/xml";
//       }

//       return manifest.body;
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//       }),
//       query: t.Object({
//         token: t.String(),
//       }),
//     }
//   )
//   .get(
//     "/encryption",
//     async ({ query }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         query.token
//       );
//       console.log(tokenData);

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select()
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       const media = await database
//         .select({
//           id: mediasTable.id,

//           encryptionKey: mediasTable.encryptionKey,
//           encryptionValue: mediasTable.encryptionValue,

//           type: mediasTable.type,
//         })
//         .from(mediasTable)
//         .where(eq(mediasTable.id, playback.mediaId!))
//         .limit(1)
//         .then((res) => res[0]);

//       if (media.type === "DASH") {
//         const keyId = Buffer.from(decrypt(media.encryptionKey!), "hex")
//           .toString("base64")
//           .replaceAll("=", "")
//           .replaceAll("+", "-")
//           .replaceAll("/", "_");

//         const keyValue = Buffer.from(decrypt(media.encryptionValue!), "hex")
//           .toString("base64")
//           .replaceAll("=", "")
//           .replaceAll("+", "-")
//           .replaceAll("/", "_");

//         return {
//           "org.w3.clearkey": {
//             clearkeys: {
//               [keyId]: keyValue,
//             },
//           },
//         };
//       }
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//       }),
//       query: t.Object({
//         token: t.String(),
//       }),
//     }
//   )
//   .get(
//     "/range/:range",
//     async ({ query, params, set, redirect }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         query.token
//       );

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select()
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       const media = await database
//         .select({
//           id: mediasTable.id,
//           key: mediasTable.key,
//           manifestKey: mediasTable.manifestKey,
//           type: mediasTable.type,
//           encryptionKey: mediasTable.encryptionKey,
//           encryptionValue: mediasTable.encryptionValue,
//           storage: {
//             id: storagesTable.id,
//             region: storagesTable.region,
//             endpoint: storagesTable.endpoint,
//             accessKeyId: storagesTable.accessKeyId,
//             secretAccessKey: storagesTable.secretAccessKey,
//             bucket: storagesTable.bucket,
//           },
//         })
//         .from(mediasTable)
//         .where(eq(mediasTable.id, playback.mediaId!))
//         .innerJoin(storagesTable, eq(mediasTable.storageId, storagesTable.id))

//         .limit(1)
//         .then((res) => res[0]);

//       if (!media) throw new NotFoundError("Media not found");

//       const isRedirect = query.redirect ?? true;
//       const range = params.range;

//       const credentials = {
//         bucket: media.storage.bucket,
//         region: media.storage.region,
//         endpoint: media.storage.endpoint || undefined,
//         accessKeyId: decrypt(media.storage.accessKeyId!),
//         secretAccessKey: decrypt(media.storage.secretAccessKey!),
//       };

//       if (media.type === "DASH") {
//         if (isRedirect) {
//           const url = await generateGetPresignedUrlWithRange(
//             {
//               key: `${media.key}/${decodeURIComponent(atob(query.stream))}`,
//               range,
//             },
//             credentials
//           );

//           const [start, end] = range.split("-");

//           const length = parseInt(end) - parseInt(start);

//           return redirect(url);
//         }
//       }

//       return null;
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//         range: t.String(),
//       }),
//       query: t.Object({
//         token: t.String(),
//         stream: t.String(),
//         redirect: t.Optional(t.Boolean()),
//       }),
//     }
//   )
//   .get(
//     "/subtitles",
//     async ({ query, set }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         query.token
//       );

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select({
//           id: playbacksTable.id,
//           media: {
//             id: mediasTable.id,
//             key: mediasTable.key,
//             manifestKey: mediasTable.manifestKey,
//             type: mediasTable.type,
//             encryptionKey: mediasTable.encryptionKey,
//             encryptionValue: mediasTable.encryptionValue,
//           },
//           storage: {
//             id: storagesTable.id,
//             region: storagesTable.region,
//             endpoint: storagesTable.endpoint,
//             accessKeyId: storagesTable.accessKeyId,
//             secretAccessKey: storagesTable.secretAccessKey,
//             bucket: storagesTable.bucket,
//           },
//         })
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .fullJoin(mediasTable, eq(mediasTable.id, playbacksTable.mediaId))
//         .innerJoin(storagesTable, eq(mediasTable.storageId, storagesTable.id))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       if (!playback.media) throw new NotFoundError("Media not found");
//       if (!playback.storage) throw new NotFoundError("Storage not found");

//       const credentials = {
//         bucket: playback.storage.bucket,
//         region: playback.storage.region,
//         endpoint: playback.storage.endpoint || undefined,
//         accessKeyId: decrypt(playback.storage.accessKeyId!),
//         secretAccessKey: decrypt(playback.storage.secretAccessKey!),
//       };
//       const key = atob(query.stream);

//       if (playback.media.type === "DASH") {
//         const object = await getObject(
//           {
//             key: `${playback.media.key}/${decodeURIComponent(key)}`,
//           },
//           credentials
//         );

//         if (key.endsWith("ttml")) {
//           set.headers["content-type"] = "application/ttml+xml";
//         } else if (key.endsWith("vtt")) {
//           set.headers["content-type"] = "application/vtt";
//         }

//         return object.body;
//       }

//       return null;
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//       }),
//       query: t.Object({
//         token: t.String(),
//         stream: t.String(),
//       }),
//     }
//   )
//   .get(
//     "/previews",
//     async ({ query }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         query.token
//       );

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select()
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       const media = await database
//         .select({
//           id: mediasTable.id,
//           key: mediasTable.key,
//           manifestKey: mediasTable.manifestKey,
//           type: mediasTable.type,
//           previewsKey: mediasTable.previewsKey,
//           storage: {
//             id: storagesTable.id,
//             region: storagesTable.region,
//             endpoint: storagesTable.endpoint,
//             accessKeyId: storagesTable.accessKeyId,
//             secretAccessKey: storagesTable.secretAccessKey,
//             bucket: storagesTable.bucket,
//           },
//         })
//         .from(mediasTable)
//         .where(eq(mediasTable.id, playback.mediaId!))
//         .innerJoin(storagesTable, eq(mediasTable.storageId, storagesTable.id))

//         .limit(1)
//         .then((res) => res[0]);

//       if (!media) throw new NotFoundError("Media not found");
//       if (!media.previewsKey) throw new NotFoundError("Previews not found");

//       const credentials = {
//         bucket: media.storage.bucket,
//         region: media.storage.region,
//         endpoint: media.storage.endpoint || undefined,
//         accessKeyId: decrypt(media.storage.accessKeyId!),
//         secretAccessKey: decrypt(media.storage.secretAccessKey!),
//       };

//       if (media.type === "DASH") {
//         const object = await getObject({ key: media.previewsKey }, credentials);

//         const jsonString = Buffer.from(object.body).toString();

//         const parsedData = JSON.parse(jsonString);

//         return parsedData;
//       }

//       return null;
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//       }),
//       query: t.Object({
//         token: t.String(),
//       }),
//     }
//   )
//   .post(
//     "/keep-alive",
//     async ({ body }) => {
//       const tokenData = await verifyJWTToken<{ playbackId: string }>(
//         body.token
//       );

//       if (!tokenData || !tokenData.playbackId)
//         throw new BadRequestError("Invalid token");

//       const playback = await database
//         .select()
//         .from(playbacksTable)
//         .where(eq(playbacksTable.id, tokenData.playbackId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       if (playback.expiresAt && isBefore(playback.expiresAt, new Date())) {
//         await database
//           .update(playbacksTable)
//           .set({
//             status: "EXPIRED",
//           })
//           .where(eq(playbacksTable.id, playback.id));

//         return { success: false };
//       }

//       await database
//         .update(playbacksTable)
//         .set({
//           status: "ALIVE",
//           lastKeepAliveAt: sql`now()`,
//           currentTime: body.currentTime ?? undefined,
//           duration: sql`${playbacksTable.duration} + 30`,
//         })
//         .where(eq(playbacksTable.id, playback.id));

//       return { success: true };
//     },
//     {
//       params: t.Object({
//         mediaId: t.String(),
//       }),
//       body: t.Object({
//         token: t.String(),
//         currentTime: t.Optional(t.Numeric()),
//       }),
//     }
//   );

// const privateRoutes = new Elysia({ prefix: "/:mediaId/playbacks" })
//   .use(authMiddleware)
//   .post(
//     "/",
//     async ({ params, user }) => {
//       const { cannot } = getUserPermissions(user.id, user.role);

//       if (cannot("get", "Media")) throw new UnauthorizedError();

//       const media = await database
//         .select({
//           id: mediasTable.id,
//           key: mediasTable.key,

//           name: mediasTable.name,
//           size: mediasTable.size,

//           type: mediasTable.type,
//           status: mediasTable.status,
//           origin: mediasTable.origin,

//           updatedAt: mediasTable.updatedAt,
//           createdAt: mediasTable.createdAt,

//           storage: {
//             id: storagesTable.id,
//             bucket: storagesTable.bucket,
//           },
//         })
//         .from(mediasTable)
//         .leftJoin(storagesTable, eq(storagesTable.id, mediasTable.storageId))
//         .where(eq(mediasTable.id, params.mediaId))
//         .limit(1)
//         .then((res) => res[0]);

//       if (!media) throw new NotFoundError("Media not found");

//       const expiresAt = addHours(new Date(), 5);

//       const playback = await database
//         .insert(playbacksTable)
//         .values({
//           mediaId: media.id,
//           userId: user.id,
//           expiresAt,
//           status: "CREATED",
//         })
//         .returning({ id: playbacksTable.id })
//         .then((r) => r[0]);

//       if (!playback) throw new BadRequestError("Unable to create playback");

//       const token = await signJWTToken({ playbackId: playback.id });

//       const baseUrl = `${
//         env.NODE_ENV === "development"
//           ? `http://localhost:${env.PORT || 3333}`
//           : env.HOST_URL
//       }/v1`;

//       const manifestEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/manifest`;
//       const rangeEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/range`;
//       const encryptionEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/encryption`;
//       const subtitleEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/subtitles`;
//       const previewsEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/previews`;
//       const baseEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/`;

//       const keepAliveEndpoint = `${baseUrl}/medias/${media.id.toString()}/playbacks/keep-alive`;

//       return {
//         id: playback.id,
//         keepAliveIn: 30,
//         endpoints: {
//           base: baseEndpoint,
//           manifest: manifestEndpoint,
//           encryption: encryptionEndpoint,
//           range: rangeEndpoint,
//           keepAlive: keepAliveEndpoint,
//           subtitles: subtitleEndpoint,
//           previews: previewsEndpoint,
//         },
//         token,
//         expiresAt,
//       };
//     },
//     { params: t.Object({ mediaId: t.String() }) }
//   )
//   .get(
//     "/:playbackId",
//     async ({ user, params }) => {
//       const { cannot } = getUserPermissions(user.id, user.role);

//       if (cannot("get", "Media")) throw new UnauthorizedError();

//       const playback = await database
//         .select({
//           id: playbacksTable.id,
//           currentTime: playbacksTable.currentTime,
//           status: playbacksTable.status,

//           lastKeepAliveAt: playbacksTable.lastKeepAliveAt,
//           expiresAt: playbacksTable.expiresAt,

//           updatedAt: playbacksTable.updatedAt,
//           createdAt: playbacksTable.createdAt,
//         })
//         .from(playbacksTable)
//         .where(
//           and(
//             eq(playbacksTable.id, params.playbackId),
//             eq(playbacksTable.mediaId, params.mediaId)
//           )
//         )
//         .limit(1)
//         .then((r) => r[0]);

//       if (!playback) throw new NotFoundError("Playback not found");

//       // if (
//       //   isAfter(
//       //     playback.lastKeepAliveAt || playback.createdAt,
//       //     addSeconds(playback.lastKeepAliveAt || playback.createdAt, 30)
//       //   )
//       // ) {
//       //   if (
//       //     playback.status !== "INACTIVE" &&
//       //     playback.status !== "CLOSED" &&
//       //     playback.status !== "FINISHED" &&
//       //     playback.status !== "EXPIRED"
//       //   ) {
//       //     playback.status = "INACTIVE";

//       //     await database
//       //       .update(playbacksTable)
//       //       .set({ status: "INACTIVE" })
//       //       .where(eq(playbacksTable.id, playback.id));
//       //   }
//       // }

//       return playback;
//     },
//     { params: t.Object({ mediaId: t.String(), playbackId: t.String() }) }
//   )
//   .get(
//     "/",
//     async ({ user, query, params }) => {
//       const { cannot } = getUserPermissions(user.id, user.role);

//       if (cannot("get", "Playback")) throw new UnauthorizedError();

//       const page = query.page;
//       const pageSize = query.perPage || 10;

//       const totalCount = await database.$count(
//         playbacksTable,
//         eq(playbacksTable.mediaId, params.mediaId)
//       );
//       const totalPages = Math.ceil(totalCount / pageSize);

//       await Promise.all([
//         database
//           .update(playbacksTable)
//           .set({ status: "INACTIVE" })
//           .where(
//             and(
//               or(
//                 eq(playbacksTable.status, "ALIVE"),
//                 eq(playbacksTable.status, "CREATED")
//               ),
//               or(
//                 and(
//                   isNotNull(playbacksTable.lastKeepAliveAt),
//                   gte(
//                     sql`now()`,
//                     sql`${playbacksTable.lastKeepAliveAt} + interval '40 second'`
//                   )
//                 ),
//                 and(
//                   isNull(playbacksTable.lastKeepAliveAt),
//                   gte(
//                     sql`now()`,
//                     sql`${playbacksTable.createdAt} + interval '40 second'`
//                   )
//                 )
//               )
//             )
//           ),

//         database
//           .update(playbacksTable)
//           .set({ status: "EXPIRED" })
//           .where(
//             and(
//               eq(playbacksTable.status, "INACTIVE"),
//               gte(sql`now()`, playbacksTable.expiresAt)
//             )
//           ),
//       ]);

//       const playbacks = await database
//         .select({
//           id: playbacksTable.id,
//           mediaId: playbacksTable.mediaId,
//           userId: playbacksTable.userId,
//           currentTime: playbacksTable.currentTime,
//           status: playbacksTable.status,
//           lastKeepAliveAt: playbacksTable.lastKeepAliveAt,
//           duration: playbacksTable.duration,
//           createdAt: playbacksTable.createdAt,

//           user: {
//             id: usersTable.id,
//             username: usersTable.username,
//             email: usersTable.email,
//           },
//           userProfile: {
//             id: profilesTable.id,
//             nickname: profilesTable.nickname,
//             avatar: profilesTable.avatar,
//           },
//         })
//         .from(playbacksTable)
//         .where(eq(playbacksTable.mediaId, params.mediaId))
//         .leftJoin(usersTable, eq(usersTable.id, playbacksTable.userId))
//         .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
//         .orderBy(desc(playbacksTable.createdAt))
//         .limit(pageSize)
//         .offset((page - 1) * pageSize);

//       return {
//         data: playbacks.map((playback) => ({
//           ...playback,
//           user: {
//             ...playback.user,
//             profile: playback.userProfile
//               ? {
//                   ...playback.userProfile,

//                   avatarUrl: playback.userProfile.avatar
//                     ? getObjectUrl(playback.userProfile.avatar)
//                     : `https://avatar.iran.liara.run/public?username=${playback.userProfile.nickname}`,
//                 }
//               : null,
//           },
//           userProfile: undefined,
//         })),
//         pagination: {
//           size: pageSize,
//           count: Math.floor(totalCount / pageSize),
//           pages: totalPages,
//         },
//       };
//     },
//     {
//       query: t.Object({
//         page: t.Numeric({ minimum: 1 }),
//         perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
//       }),
//     }
//   );

// export const playbacksRoutes = new Elysia({})
//   .use(publicRoutes)
//   .use(privateRoutes);
