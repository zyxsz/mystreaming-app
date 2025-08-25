import type {
  StorageMetricReferenceType,
  StorageMetricType,
} from "@/app/entities/storage-metric.entity";

export interface CreateDTO {
  authorId: string | null;
  ipAddress: string | null;
  location: string | null;

  key: string | null;
  bucket?: string;
  region?: string;

  reference: string;
  referenceType: StorageMetricReferenceType;

  bytes: number;
  type: StorageMetricType;
}
