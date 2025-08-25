import type { Pagination } from "../../pagination";
import type { Title } from "../../title";

export interface GetTitlesParams {
  page: number;
  perPage?: number;
  search?: string;
}

export interface GetTitlesResponse extends Pagination<Title> {}
