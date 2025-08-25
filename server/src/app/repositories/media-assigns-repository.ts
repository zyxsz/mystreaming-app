import type { PaginationResult } from "@/core/types/pagination-result";
import type { MediaAssign } from "../entities/media-assign";

export abstract class MediaAssignsRepository {
  abstract findManyByTitleIdWithPagination(
    titleId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<MediaAssign>>;

  abstract findManyByMediaIdWithPagination(
    mediaId: string,
    page: number,
    size: number
  ): Promise<PaginationResult<MediaAssign>>;

  abstract findById(id: string): Promise<MediaAssign | null>;

  abstract save(entity: MediaAssign): Promise<void>;
  abstract delete(entity: MediaAssign): Promise<void>;
}
