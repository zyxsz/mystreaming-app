import type { Episode } from "@/app/entities/episode.entity";

export class EpisodePresenter {
  static toHttp(entity: Episode) {
    return {
      id: entity.id.toString(),
      seasonId: entity.seasonId,

      tmdbId: entity.tmdbId,
      imdbId: entity.imdbId,

      number: entity.number,

      name: entity.name,
      overview: entity.overview,

      bannerKey: entity.bannerKey,
      rating: entity.rating,

      airDate: entity.airDate,
      origin: entity.origin,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      relations: entity.relations
        ? {
            isAvailable: entity.relations.isAvailable,
          }
        : undefined,
    };
  }
}
