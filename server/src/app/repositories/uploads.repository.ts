import type { Period } from "@/core/types/period";
import type { Upload } from "../entities/upload.entity";
import type { PaginationResult } from "@/core/types/pagination-result";

export abstract class UploadsRepository {
  abstract findWithPagination(
    page: number,
    size: number,
    search?: string
  ): Promise<PaginationResult<Upload>>;

  abstract findById(id: string): Promise<Upload | null>;
  abstract findManyByPeriod(period: Period): Promise<Upload[]>;

  abstract delete(id: string): Promise<void>;

  abstract save(upload: Upload): Promise<void>;
  abstract update(upload: Upload): Promise<void>;
}
