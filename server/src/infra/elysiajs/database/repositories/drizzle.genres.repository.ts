import type { GenresRepository } from "@/app/repositories/genres.repository";
import type { Database } from "..";
import type { Genre } from "@/app/entities/genre.entity";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  isNotNull,
} from "drizzle-orm";
import { genresTable } from "../schemas/genres";
import { titlesTable } from "../schemas/titles";
import { titlesToGenres } from "../schemas/titles-to-genres";
import { DrizzleGenresMapper } from "./mappers/drizzle.genres.mapper";

export class DrizzleGenresRepository implements GenresRepository {
  constructor(private database: Database) {}

  async findManyToCollections(): Promise<Genre[]> {
    const genres = await this.database
      .select({
        ...getTableColumns(genresTable),
        titlesCount: count(titlesTable.id),
      })
      .from(genresTable)
      .leftJoin(titlesToGenres, eq(titlesToGenres.genreId, genresTable.id))
      .leftJoin(
        titlesTable,
        and(
          eq(titlesToGenres.titleId, titlesTable.id),
          gte(titlesTable.ratingCount, 200),
          isNotNull(titlesTable.bannerKey)
        )
      )
      .groupBy(genresTable.id)
      .having(({ titlesCount }) => gte(titlesCount, 30))
      .orderBy(desc(count(titlesTable.id)))
      .limit(30);

    return genres.map((genre) => DrizzleGenresMapper.toDomain(genre));
  }
}
