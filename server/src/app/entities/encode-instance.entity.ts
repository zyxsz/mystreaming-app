import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type EncodeInstanceType = "LOCAL" | "EC2";
export type EncodeInstanceStatus =
  | "PENDING"
  | "RUNNING"
  | "TERMINATED"
  | "SHUTTING_DOWN";

export interface EncodeInstanceProps {
  encodeId: string;
  actionId: string;
  externalId: string | null;

  costInCents: number | null;

  region: string | null;
  zone: string | null;
  instanceType: string | null;
  isSpot: boolean | null;

  status: EncodeInstanceStatus;
  type: EncodeInstanceType;

  updatedAt: Date;
  createdAt: Date;
}

export class EncodeInstance extends Entity<EncodeInstanceProps> {
  public get encodeId() {
    return this.props.encodeId;
  }
  public get actionId() {
    return this.props.actionId;
  }
  public get externalId() {
    return this.props.externalId;
  }
  public get costInCents() {
    return this.props.costInCents;
  }
  public get region() {
    return this.props.region;
  }
  public get zone() {
    return this.props.zone;
  }
  public get instanceType() {
    return this.props.instanceType;
  }
  public get isSpot() {
    return this.props.isSpot;
  }
  public get status() {
    return this.props.status;
  }
  public get type() {
    return this.props.type;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<EncodeInstanceProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID
  ) {
    return new EncodeInstance(
      {
        ...props,
        updatedAt: props.updatedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
  }
}
