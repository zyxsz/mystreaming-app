import type { Collection } from "@/app/entities/app-level/collection.entity";
import { TitlesPresenter } from "./titles.presenter";

export class CollectionsPresenter {
  static toHttp(entity: Collection) {
    return {
      id: entity.id.toString(),
      externalId: entity.externalId,
      name: entity.name,
      type: entity.type,
      imageType: entity.imageType,

      relations: entity.relations
        ? {
            titles: entity.relations.titles
              ? entity.relations.titles.map((title) =>
                  TitlesPresenter.toHttp(title)
                )
              : undefined,
          }
        : undefined,
    };
  }
}
