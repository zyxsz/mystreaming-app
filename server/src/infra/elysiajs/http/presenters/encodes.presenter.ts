import type { Encode } from "@/app/entities/encode.entity";
import { UploadsPresenter } from "./uploads-presenter";

export class EncodesPresenter {
  static toHttp(entity: Encode) {
    return {
      id: entity.id.toValue(),

      inputId: entity.inputId,

      videoQualities: entity.videoQualities,
      audioQualities: entity.audioQualities,
      size: entity.size,

      progress: entity.progress,
      status: entity.status,

      startedAt: entity.startedAt,
      endedAt: entity.endedAt,
      costInCents: entity.costInCents,

      key: entity.key?.toString(),
      duration: entity.duration,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      relations: entity.relations
        ? {
            input: entity.relations.input
              ? UploadsPresenter.toHttp(entity.relations.input)
              : undefined,
          }
        : undefined,
    };
  }
}
