import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { seasonsTable } from "../../schemas/seasons";
import { Season } from "@/app/entities/season.entity";

export class DrizzleSeasonsMapper {
  static toDomain(
    data: InferSelectModel<typeof seasonsTable>
    // relations?: EncodeRelations
  ) {
    return Season.create(
      {
        airDate: data.airDate,
        name: data.name,
        number: data.number,
        origin: data.origin,
        overview: data.overview,
        posterKey: data.posterKey,
        rating: data.rating,
        titleId: data.titleId,
        tmdbId: data.tmdbId,

        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
      // relations
    );
  }

  static toDrizzle(entity: Season) {
    return {
      id: entity.id.toValue(),
      airDate: entity.airDate,
      createdAt: entity.createdAt,
      name: entity.name,
      number: entity.number,
      origin: entity.origin,
      overview: entity.overview,
      posterKey: entity.posterKey,
      rating: entity.rating,
      titleId: entity.titleId,
      tmdbId: entity.tmdbId,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof seasonsTable>;
  }
}
