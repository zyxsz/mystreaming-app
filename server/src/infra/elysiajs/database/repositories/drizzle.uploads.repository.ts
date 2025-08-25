import type { Upload } from "@/app/entities/upload.entity";
import type { UploadsRepository } from "@/app/repositories/uploads.repository";
import type { PaginationResult } from "@/core/types/pagination-result";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { uploadsTable } from "../schemas/uploads";
import { DrizzleUploadsMapper } from "./mappers/drizzle.uploads.mapper";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Period } from "@/core/types/period";

export class DrizzleUploadsRepository implements UploadsRepository {
  constructor(private database: NeonDatabase) {}

  async findWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Upload>> {
    const totalCount = await this.database.$count(uploadsTable);
    const totalPages = Math.ceil(totalCount / size);

    const uploads = await this.database
      .select({
        id: uploadsTable.id,
        key: uploadsTable.key,
        originalName: uploadsTable.originalName,
        size: uploadsTable.size,
        type: uploadsTable.type,
        status: uploadsTable.status,
        updatedAt: uploadsTable.updatedAt,
        multipartUploadId: uploadsTable.multipartUploadId,
        createdAt: uploadsTable.createdAt,
      })
      .from(uploadsTable)
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(desc(uploadsTable.createdAt));

    return {
      data: uploads.map((upload) => DrizzleUploadsMapper.toDomain(upload)),
      total: totalPages,
    };
  }

  async findById(id: string): Promise<Upload | null> {
    const upload = await this.database
      .select({
        id: uploadsTable.id,
        key: uploadsTable.key,
        originalName: uploadsTable.originalName,
        size: uploadsTable.size,
        type: uploadsTable.type,
        status: uploadsTable.status,
        updatedAt: uploadsTable.updatedAt,
        multipartUploadId: uploadsTable.multipartUploadId,
        createdAt: uploadsTable.createdAt,
      })
      .from(uploadsTable)
      .where(eq(uploadsTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!upload) return null;

    return DrizzleUploadsMapper.toDomain(upload);
  }

  async findManyByPeriod(period: Period): Promise<Upload[]> {
    const results = await this.database
      .select()
      .from(uploadsTable)
      .where(
        and(
          gte(uploadsTable.createdAt, period.from),
          lte(uploadsTable.createdAt, period.to)
        )
      );

    return results.map((r) => DrizzleUploadsMapper.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.database.delete(uploadsTable).where(eq(uploadsTable.id, id));
  }

  async save(upload: Upload): Promise<void> {
    await this.database
      .insert(uploadsTable)
      .values(DrizzleUploadsMapper.toDrizzle(upload));
  }

  async update(upload: Upload): Promise<void> {
    await this.database
      .update(uploadsTable)
      .set(DrizzleUploadsMapper.toDrizzle(upload))
      .where(eq(uploadsTable.id, upload.id.toString()));
  }
}
