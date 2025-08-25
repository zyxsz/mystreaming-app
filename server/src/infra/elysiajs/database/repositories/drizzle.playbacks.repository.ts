import type { Playback } from "@/app/entities/playback.entity";
import type { PlaybacksRepository } from "@/app/repositories/playbacks.repository";

import type { Database } from "..";
import { playbacksTable } from "../schemas/playbacks";
import {
  and,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { DrizzlePlaybacksMapper } from "./mappers/drizzle.playbacks.mapper";
import type { PaginationResult } from "@/core/types/pagination-result";
import { usersTable } from "../schemas/users";
import { DrizzleUsersMapper } from "./mappers/drizzle.users.mapper";
import { profilesTable } from "../schemas/profiles";
import { DrizzleProfilesMapper } from "./mappers/drizzle.profiles.mapper";
import type { Period } from "@/core/types/period";

export class DrizzlePlaybacksRepository implements PlaybacksRepository {
  constructor(private database: Database) {}

  public now: unknown = sql`now()`;

  async findById(id: string): Promise<Playback | null> {
    const playback = await this.database
      .select()
      .from(playbacksTable)
      .where(eq(playbacksTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!playback) return null;

    return DrizzlePlaybacksMapper.toDomain(playback);
  }

  async save(entity: Playback): Promise<void> {
    await this.database
      .insert(playbacksTable)
      .values(DrizzlePlaybacksMapper.toDrizzle(entity));
  }

  async update(entity: Playback, withLastKeepAlive?: true): Promise<void> {
    await this.database
      .update(playbacksTable)
      .set({
        ...DrizzlePlaybacksMapper.toDrizzle(entity),
        lastKeepAliveAt: withLastKeepAlive ? sql`now()` : undefined,
      })
      .where(eq(playbacksTable.id, entity.id.toString()));
  }

  async findManyWithPaginationByMediaId(
    mediaId: string,
    page: number,
    perPage: number,
    withRelations?: boolean
  ): Promise<PaginationResult<Playback>> {
    if (withRelations) {
      const totalCount = await this.database.$count(
        playbacksTable,
        and(
          isNotNull(playbacksTable.userId),
          eq(playbacksTable.mediaId, mediaId)
        )
      );
      const totalPages = Math.floor(totalCount / perPage);

      const medias = await this.database
        .select()
        .from(playbacksTable)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .where(eq(playbacksTable.mediaId, mediaId))
        .leftJoin(usersTable, eq(usersTable.id, playbacksTable.userId))
        .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id))
        .orderBy(desc(playbacksTable.createdAt));

      return {
        data: medias.map((e) =>
          DrizzlePlaybacksMapper.toDomain(e.playbacks, {
            user: e.users
              ? DrizzleUsersMapper.toDomain(e.users, {
                  profile: e.profiles
                    ? DrizzleProfilesMapper.toDomain(e.profiles)
                    : undefined,
                })
              : undefined,
          })
        ),
        total: totalPages,
      };
    }

    const totalCount = await this.database.$count(
      playbacksTable,
      and(isNotNull(playbacksTable.userId), eq(playbacksTable.mediaId, mediaId))
    );
    const totalPages = Math.floor(totalCount / perPage);

    const medias = await this.database
      .select()
      .from(playbacksTable)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .where(eq(playbacksTable.mediaId, mediaId))
      .orderBy(desc(playbacksTable.createdAt));

    return {
      data: medias.map((e) => DrizzlePlaybacksMapper.toDomain(e)),
      total: totalPages,
    };
  }

  async updateAllStatus(): Promise<void> {
    await Promise.all([
      this.database
        .update(playbacksTable)
        .set({ status: "INACTIVE" })
        .where(
          and(
            or(
              eq(playbacksTable.status, "ALIVE"),
              eq(playbacksTable.status, "CREATED")
            ),
            or(
              and(
                isNotNull(playbacksTable.lastKeepAliveAt),
                gte(
                  sql`now()`,
                  sql`${playbacksTable.lastKeepAliveAt} + interval '40 second'`
                )
              ),
              and(
                isNull(playbacksTable.lastKeepAliveAt),
                gte(
                  sql`now()`,
                  sql`${playbacksTable.createdAt} + interval '40 second'`
                )
              )
            )
          )
        ),

      this.database
        .update(playbacksTable)
        .set({ status: "EXPIRED" })
        .where(
          and(
            eq(playbacksTable.status, "INACTIVE"),
            gte(sql`now()`, playbacksTable.expiresAt)
          )
        ),
    ]);
  }

  async findManyByPeriod(period: Period): Promise<Playback[]> {
    const results = await this.database
      .select()
      .from(playbacksTable)
      .where(
        and(
          gte(playbacksTable.createdAt, period.from),
          lte(playbacksTable.createdAt, period.to)
        )
      );

    return results.map((r) => DrizzlePlaybacksMapper.toDomain(r));
  }
}
