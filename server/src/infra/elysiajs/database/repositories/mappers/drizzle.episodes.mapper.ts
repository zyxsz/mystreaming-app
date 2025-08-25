import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { seasonsTable } from "../../schemas/seasons";
import { Season } from "@/app/entities/season.entity";
import type { episodesTable } from "../../schemas/episodes";
import { Episode, type EpisodeRelations } from "@/app/entities/episode.entity";

export class DrizzleEpisodesMapper {
  static toDomain(
    data: InferSelectModel<typeof episodesTable>,
    relations?: Partial<EpisodeRelations>
  ) {
    return Episode.create(
      {
        airDate: data.airDate,
        bannerKey: data.bannerKey,
        imdbId: data.imdbId,
        name: data.name,
        number: data.number,
        origin: data.origin,
        overview: data.overview,
        rating: data.rating,
        seasonId: data.seasonId,
        tmdbId: data.tmdbId,

        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined,
      relations
    );
  }

  static toDrizzle(entity: Episode) {
    return {
      id: entity.id.toValue(),
      airDate: entity.airDate,
      bannerKey: entity.bannerKey,
      createdAt: entity.createdAt,
      imdbId: entity.imdbId,
      name: entity.name,
      number: entity.number,
      origin: entity.origin,
      overview: entity.overview,
      rating: entity.rating,
      seasonId: entity.seasonId,
      tmdbId: entity.tmdbId,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof episodesTable>;
  }
}
