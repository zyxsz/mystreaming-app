import type { MediaAssign } from "../../media-assign";
import type { Pagination } from "../../pagination";

export interface GetMediaAssignsParams {
  page: number;
  perPage?: number;
}

export type GetMediaAssignsResponse = Pagination<MediaAssign>;
