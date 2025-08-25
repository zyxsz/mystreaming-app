import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type MediaStatus =
  | "CREATED"
  | "WAITING_ENCODE"
  | "AVAILABLE"
  | "DELETED";

export interface MediaProps {
  encodeId: string | null;

  name: string | null;
  status: MediaStatus | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export class Media extends Entity<MediaProps> {
  public get encodeId() {
    return this.props.encodeId;
  }
  public get name() {
    return this.props.name;
  }

  public get status() {
    return this.props.status;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  public set encodeId(v) {
    this.props.encodeId = v;
  }

  public set status(v) {
    this.props.status = v;
  }

  static create(props: Optional<MediaProps, "createdAt">, id?: UniqueEntityID) {
    return new Media(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    );
  }
}
