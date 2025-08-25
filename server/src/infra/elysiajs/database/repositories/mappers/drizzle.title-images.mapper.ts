import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { titleImagesTable } from "../../schemas/title-images";
import { TitleImage } from "@/app/entities/title-image.entity";

export class DrizzleTitleImagesMapper {
  static toDomain(
    data: InferSelectModel<typeof titleImagesTable>
    // relations?: EncodeRelations
  ) {
    return TitleImage.create(
      {
        height: data.height,
        isProcessed: data.isProcessed,
        key: data.key,
        titleId: data.titleId,
        type: data.type,
        width: data.width,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: TitleImage) {
    return {
      id: entity.id.toValue(),
      key: entity.key,
      type: entity.type,
      width: entity.width,
      createdAt: entity.createdAt,
      height: entity.height,
      isProcessed: entity.isProcessed,
      titleId: entity.titleId,
    } satisfies InferInsertModel<typeof titleImagesTable>;
  }
}
