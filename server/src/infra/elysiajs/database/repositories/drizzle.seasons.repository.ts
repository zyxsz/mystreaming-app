import type { SeasonsRepository } from "@/app/repositories/seasons.repository";
import type { Database } from "..";
import type { Season } from "@/app/entities/season.entity";
import { seasonsTable } from "../schemas/seasons";
import { and, asc, desc, eq, gt } from "drizzle-orm";
import { DrizzleSeasonsMapper } from "./mappers/drizzle.seasons.mapper";
import type { PaginationResult } from "@/core/types/pagination-result";

export class DrizzleSeasonsRepository implements SeasonsRepository {
  constructor(private database: Database) {}

  async findById(id: string): Promise<Season | null> {
    const season = await this.database
      .select()
      .from(seasonsTable)
      .where(eq(seasonsTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!season) return null;

    return DrizzleSeasonsMapper.toDomain(season);
  }

  async findFirstByTitleId(titleId: string): Promise<Season | null> {
    const season = await this.database
      .select()
      .from(seasonsTable)
      .where(and(gt(seasonsTable.number, 0), eq(seasonsTable.titleId, titleId)))
      .orderBy(asc(seasonsTable.number))
      .limit(1)
      .then((r) => r[0]);

    if (!season) return null;

    return DrizzleSeasonsMapper.toDomain(season);
  }

  async findManyByTitleId(titleId: string): Promise<Season[]> {
    const seasons = await this.database
      .select()
      .from(seasonsTable)
      .where(and(gt(seasonsTable.number, 0), eq(seasonsTable.titleId, titleId)))
      .orderBy(asc(seasonsTable.number));

    return seasons.map((season) => DrizzleSeasonsMapper.toDomain(season));
  }

  async findManyByTitleIdWithPagination(
    titleId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<Season>> {
    const totalCount = await this.database.$count(
      seasonsTable,
      eq(seasonsTable.titleId, titleId)
    );
    const totalPages = Math.ceil(totalCount / size);

    const results = await this.database
      .select()
      .from(seasonsTable)
      .where(eq(seasonsTable.titleId, titleId))
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(asc(seasonsTable.number));

    return {
      data: results.map((r) => DrizzleSeasonsMapper.toDomain(r)),
      total: totalPages,
    };
  }

  async findFirstByNumberAndTitleId(
    titleId: string,
    number: number
  ): Promise<Season | null> {
    const season = await this.database
      .select()
      .from(seasonsTable)
      .where(
        and(eq(seasonsTable.titleId, titleId), eq(seasonsTable.number, number))
      )
      .limit(1)
      .then((r) => r[0]);

    if (!season) return null;

    return DrizzleSeasonsMapper.toDomain(season);
  }
}
