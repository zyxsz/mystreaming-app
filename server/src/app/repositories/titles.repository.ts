import type { PaginationResult } from "@/core/types/pagination-result";
import type { TitleImageType } from "../entities/title-image.entity";
import type { Title } from "../entities/title.entity";

export abstract class TitlesRepository {
  abstract findManyFeatured(): Promise<Title[]>;
  abstract findById(id: string): Promise<Title | null>;

  abstract findPopularManyByGenreId(
    genreId: string,
    imageType?: TitleImageType,
    bannerSize?: number
  ): Promise<Title[]>;
  abstract findManyWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Title>>;

  abstract searchMany(query: string): Promise<Title[]>;
}
