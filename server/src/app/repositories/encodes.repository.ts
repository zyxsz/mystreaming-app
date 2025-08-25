import type { PaginationResult } from "@/core/types/pagination-result";
import type { Encode } from "../entities/encode.entity";
import type { Period } from "@/core/types/period";

export abstract class EncodesRepository {
  abstract findById(id: string): Promise<Encode | null>;
  abstract findByMediaId(mediaId: string): Promise<Encode | null>;

  abstract findWithPagination(
    page: number,
    perPage: number,
    withRelations?: boolean
  ): Promise<PaginationResult<Encode>>;

  abstract findManyByPeriod(period: Period): Promise<Encode[]>;

  abstract save(entity: Encode): Promise<void>;
  abstract update(entity: Encode): Promise<void>;
}
