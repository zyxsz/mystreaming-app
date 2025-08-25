import type {
  StorageMetric,
  StorageMetricReferenceType,
  StorageMetricType,
} from "@/app/entities/storage-metric.entity";
import type {
  Period,
  StorageMetricsRepository,
} from "@/app/repositories/storage-metrics.repository";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { storageMetricsTable } from "../schemas/storage-metrics";
import { DrizzleStorageMetricsMapper } from "./mappers/drizzle.storage-metrics.mapper";
import { and, eq, gte, lte } from "drizzle-orm";

export class DrizzleStorageMetricsRepository
  implements StorageMetricsRepository
{
  constructor(private database: NeonDatabase) {}

  async save(entity: StorageMetric): Promise<void> {
    await this.database
      .insert(storageMetricsTable)
      .values(DrizzleStorageMetricsMapper.toDrizzle(entity));
  }

  async findManyByTypeWithPeriod(
    type: StorageMetricType,
    period: Period
  ): Promise<StorageMetric[]> {
    const results = await this.database
      .select()
      .from(storageMetricsTable)
      .where(
        and(
          eq(storageMetricsTable.type, type),
          gte(storageMetricsTable.createdAt, period.from),
          lte(storageMetricsTable.createdAt, period.to)
        )
      );

    return results.map((r) => DrizzleStorageMetricsMapper.toDomain(r));
  }

  async findManyByReferenceTypeAndPeriod(
    referenceType: StorageMetricReferenceType,
    period: Period
  ): Promise<StorageMetric[]> {
    const results = await this.database
      .select()
      .from(storageMetricsTable)
      .where(
        and(
          eq(storageMetricsTable.referenceType, referenceType),
          gte(storageMetricsTable.createdAt, period.from),
          lte(storageMetricsTable.createdAt, period.to)
        )
      );

    return results.map((r) => DrizzleStorageMetricsMapper.toDomain(r));
  }
}
