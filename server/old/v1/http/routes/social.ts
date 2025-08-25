import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { database } from "@/infra/database";
import { usersTable } from "@/infra/database/schemas/users";
import { and, eq, ilike, not, or } from "drizzle-orm";
import { profilesTable } from "@/infra/database/schemas/profiles";
import { getObjectUrl } from "../services/storage";
import { friendshipRequestsTable } from "@/infra/database/schemas/friendship-requests";
import { NotFoundError } from "../../../../app/errors/not-found";
import { BadRequestError } from "../../../../app/errors/bad-request";
import { friendshipsTable } from "@/infra/database/schemas/friendships";

export const friendshipRoutes = new Elysia({ prefix: "/friendship" })
  .use(authMiddleware)
  .post(
    "/request",
    async ({ user, body }) => {
      const userTo = await database
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, body.to))
        .limit(1)
        .then((response) => response[0] || null);

      if (!userTo) throw new NotFoundError("User not found");

      const alreadyExistsRequest = await database
        .select()
        .from(friendshipRequestsTable)
        .where(
          and(
            not(eq(friendshipRequestsTable.status, "DENIED")),
            or(
              and(
                eq(friendshipRequestsTable.from, user.id),
                eq(friendshipRequestsTable.to, userTo.id)
              ),
              and(
                eq(friendshipRequestsTable.to, user.id),
                eq(friendshipRequestsTable.from, userTo.id)
              )
            )
          )
        )
        .limit(1)
        .then((response) => response[0] || null);

      if (alreadyExistsRequest)
        throw new BadRequestError("You already requested to this person");

      const request = await database
        .insert(friendshipRequestsTable)
        .values({ from: user.id, to: userTo.id, status: "PENDING" })
        .returning({ status: friendshipRequestsTable.status })
        .onConflictDoNothing()
        .then((response) => response[0] || null);

      return request;
    },
    {
      body: t.Object({
        to: t.String(),
      }),
    }
  )
  .get("/requests", async ({ user }) => {
    const friendshipRequests = await database
      .select({
        to: friendshipRequestsTable.to,
        status: friendshipRequestsTable.status,
        createdAt: friendshipRequestsTable.createdAt,
        from: {
          id: friendshipRequestsTable.from,
          username: usersTable.username,
        },
      })
      .from(friendshipRequestsTable)
      .where(
        and(
          eq(friendshipRequestsTable.to, user.id),
          eq(friendshipRequestsTable.status, "PENDING")
        )
      )
      .innerJoin(usersTable, eq(friendshipRequestsTable.from, usersTable.id))
      .limit(10);

    return friendshipRequests;
  })
  .post(
    "/requests/deny",
    async ({ user, body }) => {
      const friendshipRequest = await database
        .select()
        .from(friendshipRequestsTable)
        .where(
          and(
            eq(friendshipRequestsTable.to, user.id),
            eq(friendshipRequestsTable.from, body.from),
            eq(friendshipRequestsTable.status, "PENDING")
          )
        )
        .limit(1)
        .then((res) => res[0] || null);

      if (!friendshipRequest) throw new NotFoundError("Request not found");

      await database
        .update(friendshipRequestsTable)
        .set({ status: "DENIED" })
        .where(
          and(
            eq(friendshipRequestsTable.to, user.id),
            eq(friendshipRequestsTable.from, body.from),
            eq(friendshipRequestsTable.status, "PENDING")
          )
        );

      return { success: true };
    },
    {
      body: t.Object({
        from: t.String(),
      }),
    }
  )
  .post(
    "/requests/accept",
    async ({ user, body }) => {
      const friendshipRequest = await database
        .select()
        .from(friendshipRequestsTable)
        .where(
          and(
            eq(friendshipRequestsTable.to, user.id),
            eq(friendshipRequestsTable.from, body.from),
            eq(friendshipRequestsTable.status, "PENDING")
          )
        )
        .limit(1)
        .then((res) => res[0] || null);

      if (!friendshipRequest) throw new NotFoundError("Request not found");

      await database
        .update(friendshipRequestsTable)
        .set({ status: "ACCEPTED", acceptedAt: new Date() })
        .where(
          and(
            eq(friendshipRequestsTable.to, user.id),
            eq(friendshipRequestsTable.from, body.from),
            eq(friendshipRequestsTable.status, "PENDING")
          )
        );

      await database
        .insert(friendshipsTable)
        .values({ user1Id: body.from, user2Id: user.id });

      return { success: true };
    },
    {
      body: t.Object({
        from: t.String(),
      }),
    }
  )
  .get("/", async ({ user }) => {
    const users = await database
      .select({
        id: usersTable.id,
        username: usersTable.username,
        profile: {
          nickname: profilesTable.nickname,
          tagline: profilesTable.tagline,
          bio: profilesTable.bio,
          avatar: profilesTable.avatar,
          banner: profilesTable.banner,
        },
        friendship: {
          id: friendshipsTable.id,
          createdAt: friendshipsTable.createdAt,
        },
      })
      .from(friendshipsTable)
      .where(
        or(
          eq(friendshipsTable.user1Id, user.id),
          eq(friendshipsTable.user2Id, user.id)
        )
      )
      .innerJoin(
        usersTable,
        and(
          or(
            eq(usersTable.id, friendshipsTable.user1Id),
            eq(usersTable.id, friendshipsTable.user2Id)
          ),
          not(eq(usersTable.id, user.id))
        )
      )
      .innerJoin(profilesTable, eq(profilesTable.userId, usersTable.id));

    return users.map((user) => ({
      ...user,
      profile: {
        ...user.profile,
        avatarUrl: user.profile.avatar
          ? getObjectUrl(user.profile.avatar)
          : `https://avatar.iran.liara.run/public?username=${user.profile.nickname}`,
        bannerUrl: user.profile.banner
          ? getObjectUrl(user.profile.banner)
          : null,
      },
    }));
  });

export const socialRoutes = new Elysia({ prefix: "/social" })
  .use(authMiddleware)
  .use(friendshipRoutes)
  .get(
    "/search",
    async ({ user, query }) => {
      const users = await database
        .select({
          id: usersTable.id,
          username: usersTable.username,
          profile: {
            nickname: profilesTable.nickname,
            tagline: profilesTable.tagline,
            avatar: profilesTable.avatar,
          },
          request: {
            status: friendshipRequestsTable.status,
            from: friendshipRequestsTable.from,
            to: friendshipRequestsTable.to,
          },
        })
        .from(usersTable)
        .innerJoin(profilesTable, eq(usersTable.id, profilesTable.userId))
        .leftJoin(
          friendshipRequestsTable,
          and(
            or(
              and(
                eq(friendshipRequestsTable.from, user.id),
                eq(friendshipRequestsTable.to, usersTable.id)
              ),
              and(
                eq(friendshipRequestsTable.to, user.id),
                eq(friendshipRequestsTable.from, usersTable.id)
              )
            ),
            not(eq(friendshipRequestsTable.status, "DENIED"))
          )
        )
        .where(
          and(
            not(eq(usersTable.id, user.id)),
            or(
              ilike(usersTable.username, `%${query.name}%`),
              ilike(profilesTable.nickname, `%${query.name}%`)
            )
          )
        )
        .limit(10);

      return users.map((searchUser) => ({
        ...searchUser,
        profile: {
          ...searchUser.profile,
          avatarUrl: searchUser.profile.avatar
            ? getObjectUrl(searchUser.profile.avatar)
            : `https://avatar.iran.liara.run/public?username=${searchUser.profile.nickname}`,
        },
        request: searchUser.request
          ? {
              status: searchUser.request.status,
              isForMe: searchUser.request.to === user.id,
            }
          : null,
      }));
    },
    {
      query: t.Object({ name: t.String() }),
    }
  );
