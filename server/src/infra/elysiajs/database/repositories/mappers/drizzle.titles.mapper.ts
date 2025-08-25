import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { titlesTable } from "../../schemas/titles";
import { Title, type TitleRelations } from "@/app/entities/title.entity";

export class DrizzleTitlesMapper {
  static toDomain(
    data: InferSelectModel<typeof titlesTable>,
    relations?: TitleRelations
  ) {
    return Title.create(
      {
        bannerKey: data.bannerKey,
        externalIdentifier: data.externalIdentifier,
        imdbId: data.imdbId,
        name: data.name,
        origin: data.origin,
        originalLanguage: data.originalLanguage,
        overview: data.overview,
        popularity: data.popularity,
        posterKey: data.posterKey,
        rating: data.rating,
        ratingCount: data.ratingCount,
        releaseDate: data.releaseDate,
        tagline: data.tagline,
        tmdbId: data.tmdbId,
        type: data.type,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined,
      relations
    );
  }

  static toDrizzle(entity: Title) {
    return {
      id: entity.id.toValue(),
      origin: entity.origin,
      type: entity.type,
      bannerKey: entity.bannerKey,
      createdAt: entity.createdAt,
      externalIdentifier: entity.externalIdentifier,
      imdbId: entity.imdbId,
      name: entity.name,
      originalLanguage: entity.originalLanguage,
      overview: entity.overview,
      popularity: entity.popularity,
      posterKey: entity.posterKey,
      rating: entity.rating,
      ratingCount: entity.ratingCount,
      releaseDate: entity.releaseDate,
      tagline: entity.tagline,
      tmdbId: entity.tmdbId,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof titlesTable>;
  }
}
