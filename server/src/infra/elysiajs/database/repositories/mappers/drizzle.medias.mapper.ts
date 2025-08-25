import { Upload } from "@/app/entities/upload.entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { uploadsTable } from "../../schemas/uploads";
import type { storageMetricsTable } from "../../schemas/storage-metrics";
import { StorageMetric } from "@/app/entities/storage-metric.entity";
import type { mediasTable } from "../../schemas/medias";
import { Media } from "@/app/entities/media.entity";

export class DrizzleMediasMapper {
  static toDomain(data: InferSelectModel<typeof mediasTable>) {
    return Media.create(
      {
        encodeId: data.encodeId,
        name: data.name,
        status: data.status,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: Media) {
    return {
      createdAt: entity.createdAt,
      id: entity.id.toValue(),
      encodeId: entity.encodeId,
      name: entity.name,
      status: entity.status,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof mediasTable>;
  }
}
