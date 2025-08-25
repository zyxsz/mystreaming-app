import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type StorageMetricType = "EGRESS" | "INGRESS" | "DELETE" | "STORE";
export type StorageMetricReferenceType = "UPLOAD" | "ENCODE" | "MEDIA_PLAYBACK";

export interface StorageMetricProps {
  // Author of the request
  authorId: string | null;
  ipAddress: string | null;
  location: string | null;

  // Storage details
  key: string | null;
  bucket: string;
  region: string | null;

  // References (where it came from)
  reference: string;
  referenceType: StorageMetricReferenceType;

  // Metric data
  bytes: number;
  type: StorageMetricType;

  // Dates
  createdAt: Date;
}

export class StorageMetric extends Entity<StorageMetricProps> {
  public get authorId() {
    return this.props.authorId;
  }
  public get ipAddress() {
    return this.props.ipAddress;
  }
  public get location() {
    return this.props.location;
  }
  public get key() {
    return this.props.key;
  }
  public get bucket() {
    return this.props.bucket;
  }
  public get region() {
    return this.props.region;
  }
  public get reference() {
    return this.props.reference;
  }
  public get referenceType() {
    return this.props.referenceType;
  }
  public get bytes() {
    return this.props.bytes;
  }
  public get type() {
    return this.props.type;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<StorageMetricProps, "createdAt">,
    id?: UniqueEntityID
  ) {
    return new StorageMetric(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    );
  }
}
