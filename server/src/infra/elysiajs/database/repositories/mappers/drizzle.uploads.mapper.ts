import { Upload } from "@/app/entities/upload.entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { uploadsTable } from "../../schemas/uploads";

export class DrizzleUploadsMapper {
  static toDomain(data: InferSelectModel<typeof uploadsTable>) {
    return Upload.create(
      {
        key: data.key,
        multipartUploadId: data.multipartUploadId,
        originalName: data.originalName,
        size: data.size,
        status: data.status,
        type: data.type,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: Upload) {
    return {
      key: entity.key,
      multipartUploadId: entity.multipartUploadId,
      originalName: entity.originalName,
      size: entity.size,
      type: entity.type,
      createdAt: entity.createdAt,
      id: entity.id.toValue(),
      status: entity.status,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof uploadsTable>;
  }
}
