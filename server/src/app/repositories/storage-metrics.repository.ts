import type { Period } from "@/core/types/period";
import type {
  StorageMetric,
  StorageMetricReferenceType,
  StorageMetricType,
} from "../entities/storage-metric.entity";

export abstract class StorageMetricsRepository {
  abstract findManyByTypeWithPeriod(
    type: StorageMetricType,
    period: Period
  ): Promise<StorageMetric[]>;

  abstract findManyByReferenceTypeAndPeriod(
    referenceType: StorageMetricReferenceType,
    period: Period
  ): Promise<StorageMetric[]>;

  abstract save(entity: StorageMetric): Promise<void>;
}
