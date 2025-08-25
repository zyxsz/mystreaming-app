import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { Encode, type EncodeRelations } from "@/app/entities/encode.entity";
import type { encodesTable } from "../../schemas/encodes";

export class DrizzleEncodesMapper {
  static toDomain(
    data: InferSelectModel<typeof encodesTable>,
    relations?: EncodeRelations
  ) {
    return Encode.create(
      {
        audioQualities: data.audioQualities,
        costInCents: data.costInCents,
        endedAt: data.endedAt,
        inputId: data.inputId,
        progress: data.progress,
        size: data.size,
        startedAt: data.startedAt,
        status: data.status,
        videoQualities: data.videoQualities,
        duration: data.duration,
        encryptions: data.encryptions,
        key: data.key,
        manifestKey: data.manifestKey,
        previewsKey: data.previewsKey,
        thumbnailKey: data.thumbnailKey,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined,
      relations
    );
  }

  static toDrizzle(entity: Encode) {
    return {
      id: entity.id.toValue(),
      audioQualities: entity.audioQualities,
      costInCents: entity.costInCents,
      createdAt: entity.createdAt,
      endedAt: entity.endedAt,
      inputId: entity.inputId,
      progress: entity.progress,
      size: entity.size,
      startedAt: entity.startedAt,
      status: entity.status,
      updatedAt: entity.updatedAt,
      videoQualities: entity.videoQualities,
      duration: entity.duration,

      encryptions: entity.encryptions,
      key: entity.key,
      manifestKey: entity.manifestKey,

      previewsKey: entity.previewsKey,

      thumbnailKey: entity.thumbnailKey,
    } satisfies InferInsertModel<typeof encodesTable>;
  }
}
