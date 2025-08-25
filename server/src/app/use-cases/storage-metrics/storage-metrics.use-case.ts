import type { StorageMetricsRepository } from "@/app/repositories/storage-metrics.repository";
import type { CreateDTO } from "./storage-metrics.dto";
import { StorageMetric } from "@/app/entities/storage-metric.entity";
import { env } from "@/config/env";

export class StorageMetricsUseCase {
  constructor(private storageMetricsRepository: StorageMetricsRepository) {}

  async create(dto: CreateDTO) {
    const storageMetric = StorageMetric.create({
      authorId: dto.authorId,
      bucket: dto.bucket || env.S3_BUCKET,
      region: dto.region || env.S3_REGION,
      bytes: dto.bytes,
      ipAddress: dto.ipAddress,
      key: dto.key,
      location: dto.location,
      reference: dto.reference,
      referenceType: dto.referenceType,
      type: dto.type,
    });

    await this.storageMetricsRepository.save(storageMetric);

    return storageMetric;
  }
}
