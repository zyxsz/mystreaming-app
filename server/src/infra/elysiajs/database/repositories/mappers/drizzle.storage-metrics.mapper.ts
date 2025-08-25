import { Upload } from "@/app/entities/upload.entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { uploadsTable } from "../../schemas/uploads";
import type { storageMetricsTable } from "../../schemas/storage-metrics";
import { StorageMetric } from "@/app/entities/storage-metric.entity";

export class DrizzleStorageMetricsMapper {
  static toDomain(data: InferSelectModel<typeof storageMetricsTable>) {
    return StorageMetric.create(
      {
        authorId: data.authorId,
        bucket: data.bucket,
        bytes: data.bytes,
        ipAddress: data.ipAddress,
        key: data.key,
        location: data.location,
        reference: data.reference,
        referenceType: data.referenceType,
        region: data.region,
        type: data.type,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: StorageMetric) {
    return {
      createdAt: entity.createdAt,
      id: entity.id.toValue(),
      bucket: entity.bucket,
      bytes: entity.bytes,
      reference: entity.reference,
      referenceType: entity.referenceType,
      type: entity.type,
      authorId: entity.authorId,
      ipAddress: entity.ipAddress,
      key: entity.key,
      location: entity.location,
      region: entity.region,
    } satisfies InferInsertModel<typeof storageMetricsTable>;
  }
}
