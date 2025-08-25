import type { PaginationResult } from "@/core/types/pagination-result";
import type { Playback } from "../entities/playback.entity";
import type { Period } from "@/core/types/period";

export abstract class PlaybacksRepository {
  abstract now: unknown;

  abstract save(entity: Playback): Promise<void>;
  abstract update(entity: Playback, withLastKeepAlive?: true): Promise<void>;

  abstract findManyByPeriod(period: Period): Promise<Playback[]>;

  abstract findById(id: string): Promise<Playback | null>;
  abstract findManyWithPaginationByMediaId(
    mediaId: string,
    page: number,
    perPage: number,
    withRelations?: boolean
  ): Promise<PaginationResult<Playback>>;

  abstract updateAllStatus(): Promise<void>;
}
