import type { PaginationResult } from "@/core/types/pagination-result";
import type { Media } from "../entities/media.entity";

export abstract class MediasRepository {
  abstract findWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Media>>;

  abstract findById(id: string): Promise<Media | null>;
  abstract findByEncodeId(encodeId: string): Promise<Media | null>;

  abstract update(entity: Media): Promise<void>;
  abstract save(entity: Media): Promise<void>;

  abstract delete(entity: Media): Promise<void>;
}
