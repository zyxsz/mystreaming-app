import type { MediaAssign } from "../../media-assign";
import type { Pagination } from "../../pagination";

export interface GetTitleMediaAssignsParams {
  page: number;
  perPage?: number;
}

export type GetTitleMediaAssignsResponse = Pagination<MediaAssign>;
