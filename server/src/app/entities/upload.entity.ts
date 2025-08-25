import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type UploadStatus = "CREATED" | "UPLOADING" | "COMPLETED";

export interface UploadProps {
  multipartUploadId: string;
  key: string;
  originalName: string;
  size: number;
  type: string;
  status: UploadStatus;
  updatedAt: Date | null;
  createdAt: Date;
}

export class Upload extends Entity<UploadProps> {
  public get multipartUploadId() {
    return this.props.multipartUploadId;
  }

  public get key() {
    return this.props.key;
  }

  public get originalName() {
    return this.props.originalName;
  }

  public get size() {
    return this.props.size;
  }

  public get type() {
    return this.props.type;
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

  public set status(v) {
    this.props.status = v;
  }

  static create(
    props: Optional<UploadProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID
  ) {
    const entity = new Upload(
      {
        ...props,
        updatedAt: props?.updatedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );

    return entity;
  }
}
