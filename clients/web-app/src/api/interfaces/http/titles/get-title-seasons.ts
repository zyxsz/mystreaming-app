import type { Pagination } from "../../pagination";
import type { Season } from "../../season";

export interface GetTitleSeasonsParams {
  page: number;
  perPage?: number;
}

export type GetTItleSeasonsResponse = Pagination<Season>;
