import type { Encode } from "../../encode";
import type { Pagination } from "../../pagination";

export interface GetEncodesParams {
  page: number;
  perPage?: number;
}

export interface GetEncodesResult extends Pagination<Encode> {}
