import type { TitlesRepository } from "@/app/repositories/titles.repository";
import type { Database } from "..";
import type { Title } from "@/app/entities/title.entity";
import { titlesTable } from "../schemas/titles";
import {
  and,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  isNotNull,
  or,
  type InferSelectModel,
} from "drizzle-orm";
import { shuffle } from "@/infra/lib/shuffle";
import { DrizzleTitlesMapper } from "./mappers/drizzle.titles.mapper";
import { titlesToGenres } from "../schemas/titles-to-genres";
import { titleImagesTable } from "../schemas/title-images";
import type { TitleImageType } from "@/app/entities/title-image.entity";
import { DrizzleTitleImagesMapper } from "./mappers/drizzle.title-images.mapper";
import type { PaginationResult } from "@/core/types/pagination-result";

export class DrizzleTitlesRepository implements TitlesRepository {
  constructor(private database: Database) {}

  async findManyFeatured(): Promise<Title[]> {
    const titles = await this.database
      .select()
      .from(titlesTable)
      .where(
        and(gte(titlesTable.ratingCount, 200), isNotNull(titlesTable.bannerKey))
      )
      .orderBy(desc(titlesTable.popularity), desc(titlesTable.rating))
      .limit(35);

    const featuredTitles = shuffle(titles).slice(0, 8);

    return featuredTitles.map((title) => DrizzleTitlesMapper.toDomain(title));
  }

  async findById(id: string): Promise<Title | null> {
    const title = await this.database
      .select()
      .from(titlesTable)
      .where(eq(titlesTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!title) return null;

    return DrizzleTitlesMapper.toDomain(title);
  }

  async findPopularManyByGenreId(
    genreId: string,
    imageType?: TitleImageType,
    bannerSize?: number
  ): Promise<Title[]> {
    const movieTitles = await this.database
      .select({
        title: getTableColumns(titlesTable),
        image: getTableColumns(titleImagesTable),
      })
      .from(titlesToGenres)
      .where(eq(titlesToGenres.genreId, genreId))
      .innerJoin(
        titlesTable,
        and(
          eq(titlesTable.id, titlesToGenres.titleId),
          gte(titlesTable.ratingCount, 100),
          isNotNull(titlesTable.bannerKey),
          isNotNull(titlesTable.name),
          eq(titlesTable.type, "MOVIE")
        )
      )
      .leftJoin(
        titleImagesTable,
        and(
          eq(titleImagesTable.titleId, titlesTable.id),
          imageType ? eq(titleImagesTable.type, imageType) : undefined,
          bannerSize ? eq(titleImagesTable.width, bannerSize) : undefined
        )
      )
      .orderBy(desc(titlesTable.popularity))
      .limit(40);

    const tvShowTitles = await this.database
      .select({
        title: getTableColumns(titlesTable),
        image: getTableColumns(titleImagesTable),
      })
      .from(titlesToGenres)
      .where(eq(titlesToGenres.genreId, genreId))
      .innerJoin(
        titlesTable,
        and(
          eq(titlesTable.id, titlesToGenres.titleId),
          gte(titlesTable.ratingCount, 100),
          isNotNull(titlesTable.bannerKey),
          isNotNull(titlesTable.name),
          eq(titlesTable.type, "TV_SHOW")
        )
      )
      .leftJoin(
        titleImagesTable,
        and(
          eq(titleImagesTable.titleId, titlesTable.id),
          imageType ? eq(titleImagesTable.type, imageType) : undefined,
          bannerSize ? eq(titleImagesTable.width, bannerSize) : undefined
        )
      )
      .orderBy(desc(titlesTable.popularity))
      .limit(40);

    const movieTitlesReduced = movieTitles.reduce((acc, row) => {
      const title = row.title;
      const image = row.image;

      if (!acc[title.id]) {
        acc[title.id] = { ...title, images: [] };
      }
      if (image) {
        acc[title.id].images.push(image);
      }

      return acc;
    }, {} as Record<string, InferSelectModel<typeof titlesTable> & { images: InferSelectModel<typeof titleImagesTable>[] }>);

    const tvShowTitlesReduced = tvShowTitles.reduce((acc, row) => {
      const title = row.title;
      const image = row.image;

      if (!acc[title.id]) {
        acc[title.id] = { ...title, images: [] };
      }
      if (image) {
        acc[title.id].images.push(image);
      }

      return acc;
    }, {} as Record<string, InferSelectModel<typeof titlesTable> & { images: InferSelectModel<typeof titleImagesTable>[] }>);

    return shuffle([
      ...Object.values(movieTitlesReduced).slice(0, 10),
      ...Object.values(tvShowTitlesReduced).slice(0, 10),
    ]).map((title) =>
      DrizzleTitlesMapper.toDomain(title, {
        images: title.images
          ? title.images.map((image) =>
              DrizzleTitleImagesMapper.toDomain(image)
            )
          : [],
      })
    );
  }

  async findManyWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Title>> {
    const filter = search ? ilike(titlesTable.name, `%${search}%`) : undefined;

    const totalCount = await this.database.$count(titlesTable, filter);
    const totalPages = Math.ceil(totalCount / size);

    const medias = await this.database
      .select()
      .from(titlesTable)
      .where(filter)
      .limit(size)
      .offset((page - 1) * size)
      .orderBy(desc(titlesTable.ratingCount));

    return {
      data: medias.map((media) => DrizzleTitlesMapper.toDomain(media)),
      total: totalPages,
    };
  }

  async searchMany(query: string): Promise<Title[]> {
    const results = await this.database
      .select()
      .from(titlesTable)
      .where(
        or(
          ilike(titlesTable.name, `%${query}%`),
          ilike(titlesTable.overview, `%${query}%`)
        )
      )
      .limit(25);

    return results.map((title) => DrizzleTitlesMapper.toDomain(title));
  }
}
