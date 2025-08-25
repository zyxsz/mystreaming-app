import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type EncodeActionType = "ENCODE_VIDEO";
export type EncodeActionStatus =
  | "COMPLETED"
  | "STARTING"
  | "PENDING"
  | "PROCESSING";

export interface EncodeActionProps {
  encodeId: string;
  userId: string | null;

  isAutomated: boolean;

  status: EncodeActionStatus;
  type: EncodeActionType;

  finishedAt: Date | null;
  updatedAt: Date;
  createdAt: Date;
}

export class EncodeAction extends Entity<EncodeActionProps> {
  public get encodeId() {
    return this.props.encodeId;
  }
  public get userId() {
    return this.props.userId;
  }
  public get isAutomated() {
    return this.props.isAutomated;
  }
  public get status() {
    return this.props.status;
  }
  public get type() {
    return this.props.type;
  }
  public get finishedAt() {
    return this.props.finishedAt;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<EncodeActionProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID
  ) {
    return new EncodeAction(
      {
        ...props,
        updatedAt: props.updatedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
  }
}
