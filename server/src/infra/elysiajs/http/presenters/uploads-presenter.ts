import type { Upload } from "@/app/entities/upload.entity";

export class UploadsPresenter {
  static toHttp(entity: Upload) {
    return {
      id: entity.id.toValue(),
      key: entity.key,
      originalName: entity.originalName,
      size: entity.size,
      type: entity.type,
      status: entity.status,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}
