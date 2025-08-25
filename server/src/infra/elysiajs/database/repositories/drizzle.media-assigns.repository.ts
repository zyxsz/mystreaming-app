import type { MediaAssignsRepository } from "@/app/repositories/media-assigns-repository";
import type { Database } from "..";
import type { MediaAssign } from "@/app/entities/media-assign";
import { mediaAssignsTable } from "../schemas/media-assigns";
import { desc, eq } from "drizzle-orm";
import { DrizzleMediaAssignsMapper } from "./mappers/drizzle.media-assigns.mapper";
import type { PaginationResult } from "@/core/types/pagination-result";
import { mediasTable } from "../schemas/medias";
import { DrizzleMediasMapper } from "./mappers/drizzle.medias.mapper";
import { episodesTable } from "../schemas/episodes";
import { usersTable } from "../schemas/users";
import { DrizzleEpisodesMapper } from "./mappers/drizzle.episodes.mapper";
import { DrizzleUsersMapper } from "./mappers/drizzle.users.mapper";
import { profilesTable } from "../schemas/profiles";
import { DrizzleProfilesMapper } from "./mappers/drizzle.profiles.mapper";
import { titlesTable } from "../schemas/titles";
import { DrizzleTitlesMapper } from "./mappers/drizzle.titles.mapper";

export class DrizzleMediaAssignsRepository implements MediaAssignsRepository {
  constructor(private database: Database) {}

  async findManyByTitleIdWithPagination(
    titleId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<MediaAssign>> {
    const totalCount = await this.database.$count(
      mediaAssignsTable,
      eq(mediaAssignsTable.titleId, titleId)
    );
    const totalPages = Math.ceil(totalCount / size);

    const results = await this.database
      .select()
      .from(mediaAssignsTable)
      .where(eq(mediaAssignsTable.titleId, titleId))
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(desc(mediaAssignsTable.assignedAt))
      .leftJoin(mediasTable, eq(mediasTable.id, mediaAssignsTable.mediaId))
      .leftJoin(
        episodesTable,
        eq(episodesTable.id, mediaAssignsTable.episodeId)
      )
      .leftJoin(usersTable, eq(usersTable.id, mediaAssignsTable.assignedBy))
      .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id));

    return {
      data: results.map((r) =>
        DrizzleMediaAssignsMapper.toDomain(r.mediaAssigns, {
          media: r.medias ? DrizzleMediasMapper.toDomain(r.medias) : undefined,
          episode: r.episodes
            ? DrizzleEpisodesMapper.toDomain(r.episodes)
            : undefined,
          assignedBy: r.users
            ? DrizzleUsersMapper.toDomain(r.users, {
                profile: r.profiles
                  ? DrizzleProfilesMapper.toDomain(r.profiles)
                  : undefined,
              })
            : undefined,
        })
      ),
      total: totalPages,
    };
  }

  async findManyByMediaIdWithPagination(
    mediaId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<MediaAssign>> {
    const totalCount = await this.database.$count(
      mediaAssignsTable,
      eq(mediaAssignsTable.mediaId, mediaId)
    );
    const totalPages = Math.ceil(totalCount / size);

    const results = await this.database
      .select()
      .from(mediaAssignsTable)
      .where(eq(mediaAssignsTable.mediaId, mediaId))
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(desc(mediaAssignsTable.assignedAt))
      .leftJoin(titlesTable, eq(titlesTable.id, mediaAssignsTable.titleId))
      .leftJoin(
        episodesTable,
        eq(episodesTable.id, mediaAssignsTable.episodeId)
      )
      .leftJoin(usersTable, eq(usersTable.id, mediaAssignsTable.assignedBy))
      .leftJoin(profilesTable, eq(profilesTable.userId, usersTable.id));

    return {
      data: results.map((r) =>
        DrizzleMediaAssignsMapper.toDomain(r.mediaAssigns, {
          episode: r.episodes
            ? DrizzleEpisodesMapper.toDomain(r.episodes)
            : undefined,
          assignedBy: r.users
            ? DrizzleUsersMapper.toDomain(r.users, {
                profile: r.profiles
                  ? DrizzleProfilesMapper.toDomain(r.profiles)
                  : undefined,
              })
            : undefined,
          title: r.titles ? DrizzleTitlesMapper.toDomain(r.titles) : undefined,
        })
      ),
      total: totalPages,
    };
  }

  async findById(id: string): Promise<MediaAssign | null> {
    const result = await this.database
      .select()
      .from(mediaAssignsTable)
      .where(eq(mediaAssignsTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!result) return null;

    return DrizzleMediaAssignsMapper.toDomain(result);
  }

  async save(entity: MediaAssign): Promise<void> {
    console.log(DrizzleMediaAssignsMapper.toDrizzle(entity));

    await this.database
      .insert(mediaAssignsTable)
      .values(DrizzleMediaAssignsMapper.toDrizzle(entity));
  }

  async delete(entity: MediaAssign): Promise<void> {
    await this.database
      .delete(mediaAssignsTable)
      .where(eq(mediaAssignsTable.id, entity.id.toString()));
  }
}
