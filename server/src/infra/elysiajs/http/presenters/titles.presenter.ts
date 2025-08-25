import type { Title } from "@/app/entities/title.entity";
import { TitleImagesPresenter } from "./title-images.presenter";

export class TitlesPresenter {
  static toHttp(entity: Title) {
    return {
      id: entity.id.toString(),

      tmdbId: entity.tmdbId,
      imdbId: entity.imdbId,

      name: entity.name,
      overview: entity.overview,
      tagline: entity.tagline,

      releaseDate: entity.releaseDate,
      originalLanguage: entity.originalLanguage,

      popularity: entity.popularity,
      rating: entity.rating,
      ratingCount: entity.ratingCount,

      bannerKey: entity.bannerKey,
      posterKey: entity.posterKey,

      origin: entity.origin,
      type: entity.type,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      extras: {
        bannerUrl: entity.bannerKey
          ? `https://image.tmdb.org/t/p/w1920${entity.bannerKey}`
          : undefined,

        posterUrl: entity.posterKey
          ? `https://image.tmdb.org/t/p/w1920${entity.posterKey}`
          : undefined,
      },

      relations: entity.relations
        ? {
            images:
              entity.relations.images?.map((image) =>
                TitleImagesPresenter.toHttp(image)
              ) || undefined,
          }
        : undefined,
    };
  }
}
