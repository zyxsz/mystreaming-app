import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { genresTable } from "../../schemas/genres";
import { Genre } from "@/app/entities/genre.entity";

export class DrizzleGenresMapper {
  static toDomain(
    data: InferSelectModel<typeof genresTable>
    // relations?: EncodeRelations
  ) {
    return Genre.create(
      {
        defaultLanguage: data.defaultLanguage,
        externalId: data.externalId,
        name: data.name,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: Genre) {
    return {
      id: entity.id.toValue(),
      externalId: entity.externalId,
      defaultLanguage: entity.defaultLanguage,
      name: entity.name,
    } satisfies InferInsertModel<typeof genresTable>;
  }
}
