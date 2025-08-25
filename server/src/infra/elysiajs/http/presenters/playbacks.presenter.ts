import type { Playback } from "@/app/entities/playback.entity";
import { UsersPresenter } from "./users.presenter";

export class PlaybacksPresenter {
  static toHttp(entity: Playback) {
    return {
      id: entity.id.toString(),
      userId: entity.userId?.toString(),
      mediaId: entity.mediaId?.toString(),

      currentTime: entity.currentTime,
      duration: entity.duration,
      status: entity.status,

      lastKeepAliveAt: entity.lastKeepAliveAt,
      expiresAt: entity.expiresAt,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      relations: entity.relations
        ? {
            user: entity.relations.user
              ? UsersPresenter.toHttp(entity.relations.user)
              : undefined,
          }
        : undefined,
    };
  }
}
