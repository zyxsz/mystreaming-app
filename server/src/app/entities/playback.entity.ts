import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { User } from "./user.entity";

export type PlaybackStatus =
  | "CREATED"
  | "ALIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "FINISHED"
  | "CLOSED";

export interface PlaybackProps {
  userId: string | null;
  mediaId: string | null;

  currentTime: number | null;
  status: PlaybackStatus | null;

  lastKeepAliveAt: Date | null;
  expiresAt: Date | null;

  duration: number | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export interface PlaybackRelations {
  user: User;
}

export class Playback extends Entity<PlaybackProps, PlaybackRelations> {
  public get userId() {
    return this.props.userId;
  }
  public get mediaId() {
    return this.props.mediaId;
  }
  public get currentTime() {
    return this.props.currentTime;
  }
  public get status() {
    return this.props.status;
  }
  public get lastKeepAliveAt() {
    return this.props.lastKeepAliveAt;
  }
  public get expiresAt() {
    return this.props.expiresAt;
  }
  public get duration() {
    return this.props.duration;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  public set status(v) {
    this.props.status = v;
  }
  public set lastKeepAliveAt(v) {
    this.props.lastKeepAliveAt = v;
  }
  public set duration(v) {
    this.props.duration = v;
  }
  public set currentTime(v) {
    this.props.currentTime = v;
  }

  static create(
    props: Optional<PlaybackProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID,
    relations?: Partial<PlaybackRelations>
  ) {
    return new Playback(
      {
        ...props,
        updatedAt: props.updatedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
      relations
    );
  }
}
