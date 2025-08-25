import type { PaginationResult } from "@/core/types/pagination-result";
import type { Season } from "../entities/season.entity";

export abstract class SeasonsRepository {
  abstract findFirstByTitleId(titleId: string): Promise<Season | null>;
  abstract findById(id: string): Promise<Season | null>;
  abstract findManyByTitleId(titleId: string): Promise<Season[]>;
  abstract findManyByTitleIdWithPagination(
    titleId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<Season>>;

  abstract findFirstByNumberAndTitleId(
    titleId: string,
    number: number
  ): Promise<Season | null>;
}
