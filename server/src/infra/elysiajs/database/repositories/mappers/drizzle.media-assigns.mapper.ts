import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { mediaAssignsTable } from "../../schemas/media-assigns";
import {
  MediaAssign,
  type MediaAssignRelations,
} from "@/app/entities/media-assign";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export class DrizzleMediaAssignsMapper {
  static toDomain(
    data: InferSelectModel<typeof mediaAssignsTable>,
    relations?: Partial<MediaAssignRelations>
  ) {
    return MediaAssign.create(
      {
        assignedAt: data.assignedAt,
        assignedBy: data.assignedBy,
        episodeId: data.episodeId,
        mediaId: data.mediaId,
        titleId: data.titleId,
      },
      new UniqueEntityID(data.id),
      relations
    );
  }

  static toDrizzle(entity: MediaAssign) {
    return {
      id: entity.id.toString(),
      mediaId: entity.mediaId,
      titleId: entity.titleId,
      assignedAt: entity.assignedAt,
      assignedBy: entity.assignedBy,
      episodeId: entity.episodeId,
    } satisfies InferInsertModel<typeof mediaAssignsTable>;
  }
}
