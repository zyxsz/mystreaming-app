import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Media } from "./media.entity";
import type { User } from "./user.entity";
import type { Episode } from "./episode.entity";
import type { Title } from "./title.entity";

export interface MediaAssignProps {
  titleId: string;
  mediaId: string;
  episodeId: string | null;
  assignedBy: string | null;
  assignedAt: Date;
}

export interface MediaAssignRelations {
  media: Media;
  assignedBy: User;
  episode: Episode;
  title: Title;
}

export class MediaAssign extends Entity<
  MediaAssignProps,
  MediaAssignRelations
> {
  public get titleId() {
    return this.props.titleId;
  }
  public get mediaId() {
    return this.props.mediaId;
  }
  public get episodeId() {
    return this.props.episodeId;
  }
  public get assignedBy() {
    return this.props.assignedBy;
  }
  public get assignedAt() {
    return this.props.assignedAt;
  }

  static create(
    props: MediaAssignProps,
    id?: UniqueEntityID,
    relations?: Partial<MediaAssignRelations>
  ) {
    return new MediaAssign(props, id, relations);
  }
}
