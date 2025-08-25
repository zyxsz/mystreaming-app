import type { EncodesRepository } from "@/app/repositories/encodes.repository";
import type { Database } from "..";
import type { Encode } from "@/app/entities/encode.entity";
import { encodesTable } from "../schemas/encodes";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { DrizzleEncodesMapper } from "./mappers/drizzle.encodes.mapper";
import type { PaginationResult } from "@/core/types/pagination-result";
import { uploadsTable } from "../schemas/uploads";
import { DrizzleUploadsMapper } from "./mappers/drizzle.uploads.mapper";
import { mediasTable } from "../schemas/medias";
import type { Period } from "@/core/types/period";

export class DrizzleEncodesRepository implements EncodesRepository {
  constructor(private database: Database) {}

  async findById(id: string): Promise<Encode | null> {
    const encode = await this.database
      .select()
      .from(encodesTable)
      .where(eq(encodesTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!encode) return null;

    return DrizzleEncodesMapper.toDomain(encode);
  }

  async findByMediaId(mediaId: string): Promise<Encode | null> {
    const encode = await this.database
      .select()
      .from(encodesTable)
      .innerJoin(
        mediasTable,
        and(
          eq(mediasTable.id, mediaId),
          eq(mediasTable.encodeId, encodesTable.id)
        )
      )
      .limit(1)
      .then((r) => r[0]);

    if (!encode.encodes) return null;

    return DrizzleEncodesMapper.toDomain(encode.encodes);
  }

  async save(entity: Encode): Promise<void> {
    await this.database
      .insert(encodesTable)
      .values(DrizzleEncodesMapper.toDrizzle(entity));
  }

  async update(entity: Encode): Promise<void> {
    await this.database
      .update(encodesTable)
      .set(DrizzleEncodesMapper.toDrizzle(entity))
      .where(eq(encodesTable.id, entity.id.toValue()));
  }

  async findWithPagination(
    page: number,
    perPage: number,
    withRelations?: boolean
  ): Promise<PaginationResult<Encode>> {
    const totalCount = await this.database.$count(encodesTable);
    const totalPages = Math.ceil(totalCount / perPage);

    if (withRelations) {
      const results = await this.database
        .select()
        .from(encodesTable)
        .limit(perPage)
        .offset((page - 1) * perPage)
        .orderBy(desc(encodesTable.createdAt))
        .leftJoin(uploadsTable, eq(uploadsTable.id, encodesTable.inputId));

      return {
        data: results.map((r) =>
          DrizzleEncodesMapper.toDomain(
            r.encodes,
            withRelations
              ? {
                  input: r.uploads
                    ? DrizzleUploadsMapper.toDomain(r.uploads)
                    : undefined,
                }
              : undefined
          )
        ),
        total: totalPages,
      };
    }

    const results = await this.database
      .select()
      .from(encodesTable)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .orderBy(desc(encodesTable.createdAt));

    return {
      data: results.map((r) => DrizzleEncodesMapper.toDomain(r)),
      total: totalPages,
    };
  }

  async findManyByPeriod(period: Period): Promise<Encode[]> {
    const results = await this.database
      .select()
      .from(encodesTable)
      .where(
        and(
          gte(encodesTable.createdAt, period.from),
          lte(encodesTable.createdAt, period.to)
        )
      );
    return results.map((r) => DrizzleEncodesMapper.toDomain(r));
  }
}
