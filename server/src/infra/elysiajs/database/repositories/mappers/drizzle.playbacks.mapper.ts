import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import {
  Playback,
  type PlaybackRelations,
} from "@/app/entities/playback.entity";
import type { playbacksTable } from "../../schemas/playbacks";

export class DrizzlePlaybacksMapper {
  static toDomain(
    data: InferSelectModel<typeof playbacksTable>,
    relations?: Partial<PlaybackRelations>
  ) {
    return Playback.create(
      {
        duration: data.duration,
        currentTime: data.currentTime,
        expiresAt: data.expiresAt,
        lastKeepAliveAt: data.lastKeepAliveAt,
        mediaId: data.mediaId,
        status: data.status,
        userId: data.userId,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined,
      relations
    );
  }

  static toDrizzle(entity: Playback) {
    return {
      createdAt: entity.createdAt,
      currentTime: entity.currentTime,
      duration: entity.duration,
      expiresAt: entity.expiresAt,
      id: entity.id.toValue(),
      lastKeepAliveAt: entity.lastKeepAliveAt,
      mediaId: entity.mediaId,
      status: entity.status,
      userId: entity.userId,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof playbacksTable>;
  }
}
