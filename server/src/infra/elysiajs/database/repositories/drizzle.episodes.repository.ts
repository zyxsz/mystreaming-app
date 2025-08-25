import type { EpisodesRepository } from "@/app/repositories/episodes.repository";
import type { Database } from "..";
import type { Episode } from "@/app/entities/episode.entity";
import { episodesTable } from "../schemas/episodes";
import { and, asc, eq, getTableColumns, sql } from "drizzle-orm";
import { DrizzleEpisodesMapper } from "./mappers/drizzle.episodes.mapper";
import { mediaAssignsTable } from "../schemas/media-assigns";

export class DrizzleEpisodesRepository implements EpisodesRepository {
  constructor(private database: Database) {}

  async findManyBySeasonId(seasonId: string): Promise<Episode[]> {
    const episodes = await this.database
      .select({
        ...getTableColumns(episodesTable),
        relations: {
          isAvailable: sql`count(${mediaAssignsTable}) >= 1`,
        },
      })
      .from(episodesTable)
      .where(eq(episodesTable.seasonId, seasonId))
      .leftJoin(
        mediaAssignsTable,
        eq(mediaAssignsTable.episodeId, episodesTable.id)
      )
      .groupBy(episodesTable.id)
      .orderBy(asc(episodesTable.number));

    return episodes.map((episode) =>
      DrizzleEpisodesMapper.toDomain(
        episode,
        episode.relations
          ? {
              isAvailable:
                (episode.relations.isAvailable as boolean) || undefined,
            }
          : undefined
      )
    );
  }

  async findFirstBySeasonIdAndNumber(
    seasonId: string,
    number: number
  ): Promise<Episode | null> {
    const episode = await this.database
      .select()
      .from(episodesTable)
      .where(
        and(
          eq(episodesTable.seasonId, seasonId),
          eq(episodesTable.number, number)
        )
      )
      .limit(1)
      .then((r) => r[0]);

    if (!episode) return null;

    return DrizzleEpisodesMapper.toDomain(episode);
  }
}
