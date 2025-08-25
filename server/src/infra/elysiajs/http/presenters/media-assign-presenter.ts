import type { MediaAssign } from "@/app/entities/media-assign";
import { MediasPresenter } from "./medias.presenter";
import { UsersPresenter } from "./users.presenter";
import { EpisodePresenter } from "./episode.presenter";
import { TitlesPresenter } from "./titles.presenter";

export class MediaAssignPresenter {
  static toHttp(entity: MediaAssign) {
    return {
      id: entity.id.toString(),
      titleId: entity.titleId,
      mediaId: entity.mediaId,
      episodeId: entity.episodeId,
      assignedBy: entity.assignedBy,
      assignedAt: entity.assignedAt,

      relations: entity.relations
        ? {
            media: entity.relations.media
              ? MediasPresenter.toHttp(entity.relations.media)
              : undefined,
            assignedBy: entity.relations.assignedBy
              ? UsersPresenter.toHttp(entity.relations.assignedBy)
              : undefined,
            episode: entity.relations.episode
              ? EpisodePresenter.toHttp(entity.relations.episode)
              : undefined,
            title: entity.relations.title
              ? TitlesPresenter.toHttp(entity.relations.title)
              : undefined,
          }
        : undefined,
    };
  }
}
