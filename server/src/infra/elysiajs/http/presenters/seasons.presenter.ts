import type { Season } from "@/app/entities/season.entity";

export class SeasonsPresenter {
  static toHttp(entity: Season) {
    return {
      id: entity.id.toValue(),
      titleId: entity.titleId,
      number: entity.number,
      name: entity.name,
      overview: entity.overview,
      posterKey: entity.posterKey,
      airDate: entity.airDate,
      rating: entity.rating,
      origin: entity.origin,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
