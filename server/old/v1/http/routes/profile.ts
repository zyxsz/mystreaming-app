import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { database } from "@/infra/database";
import { profilesTable } from "@/infra/database/schemas/profiles";
import { eq } from "drizzle-orm";
import { BadRequestError } from "../../../../app/errors/bad-request";
import {
  generatePutPresignedUrl,
  getObjectUrl,
  uploadFile,
} from "../services/storage";
import { InternalServerError } from "../../../../app/errors/internal-server";
import { NotFoundError } from "../../../../app/errors/not-found";
import { generateUUID } from "@/infra/lib/uuid";

export const profileRoutes = new Elysia({
  prefix: "/profile",
  detail: { tags: ["Profile"] },
})
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    const profile = await database
      .select({
        id: profilesTable.id,
        avatar: profilesTable.avatar,
        banner: profilesTable.banner,
        userId: profilesTable.userId,
        nickname: profilesTable.nickname,
        tagline: profilesTable.tagline,
        bio: profilesTable.bio,
        updatedAt: profilesTable.updatedAt,
        createdAt: profilesTable.createdAt,
      })
      .from(profilesTable)
      .where(eq(profilesTable.userId, user.id))
      .limit(1)
      .then((result) => result[0] || null);

    if (!profile) throw new NotFoundError("Profile not found");
    //a
    return {
      ...profile,
      avatarUrl: profile.avatar ? getObjectUrl(profile.avatar) : undefined,
      bannerUrl: profile.banner ? getObjectUrl(profile.banner) : undefined,
    };
  })
  .put(
    "/avatar",
    async ({ user, body }) => {
      const profile = await database
        .select({
          id: profilesTable.id,
        })
        .from(profilesTable)
        .where(eq(profilesTable.userId, user.id))
        .limit(1)
        .then((response) => response[0] || null);

      if (!profile) throw new NotFoundError("You dont have a profile");

      const key = `users/avatars/${generateUUID()}.${body.type.split("/")[1]}`;

      const url = await generatePutPresignedUrl(key, {
        length: body.size,
        type: body.type,
        acl: "public-read",
      });

      await database
        .update(profilesTable)
        .set({ avatar: key })
        .where(eq(profilesTable.id, profile.id));

      return { presignedUrl: url };
    },
    {
      body: t.Object({
        type: t.Union([
          t.Literal("image/png"),
          t.Literal("image/jpg"),
          t.Literal("image/jpeg"),
        ]),
        size: t.Optional(t.Numeric()),
      }),
    }
  )
  .put(
    "/banner",
    async ({ user, body }) => {
      const profile = await database
        .select({
          id: profilesTable.id,
        })
        .from(profilesTable)
        .where(eq(profilesTable.userId, user.id))
        .limit(1)
        .then((response) => response[0] || null);

      if (!profile) throw new NotFoundError("You dont have a profile");

      const key = `users/banners/${generateUUID()}.${body.type.split("/")[1]}`;

      const url = await generatePutPresignedUrl(key, {
        length: body.size,
        type: body.type,
        acl: "public-read",
      });

      await database
        .update(profilesTable)
        .set({ banner: key })
        .where(eq(profilesTable.id, profile.id));

      return { presignedUrl: url };
    },
    {
      body: t.Object({
        type: t.Union([
          t.Literal("image/png"),
          t.Literal("image/jpg"),
          t.Literal("image/jpeg"),
        ]),
        size: t.Optional(t.Numeric()),
      }),
    }
  )
  .post(
    "/",
    async ({ body, user }) => {
      const currentUserProfile = await database
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.userId, user.id))
        .limit(1)
        .then((result) => result[0] || null);

      if (currentUserProfile)
        throw new BadRequestError("You already has a profile");

      const profile = await database
        .insert(profilesTable)
        .values({
          userId: user.id,
          nickname: body.nickname,
          tagline: body.tagline,
          bio: body.bio,
        })
        .returning({
          id: profilesTable.id,
          avatar: profilesTable.avatar,
          banner: profilesTable.banner,
          userId: profilesTable.userId,
          nickname: profilesTable.nickname,
          tagline: profilesTable.tagline,
          bio: profilesTable.bio,
          updatedAt: profilesTable.updatedAt,
          createdAt: profilesTable.createdAt,
        })
        .then((result) => result[0] || null);

      if (!profile)
        throw new InternalServerError("Unable to create your profile");

      return profile;
    },
    {
      body: t.Object({
        nickname: t.String({ minLength: 3, maxLength: 128 }),
        tagline: t.Optional(t.String({ minLength: 4, maxLength: 32 })),
        bio: t.Optional(t.String()),
      }),
    }
  );
