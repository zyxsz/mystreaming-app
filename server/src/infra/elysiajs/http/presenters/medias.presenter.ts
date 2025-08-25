import type { Media } from "@/app/entities/media.entity";

export class MediasPresenter {
  static toHttp(entity: Media) {
    return {
      id: entity.id.toValue(),
      name: entity.name?.toString(),
      status: entity.status,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
