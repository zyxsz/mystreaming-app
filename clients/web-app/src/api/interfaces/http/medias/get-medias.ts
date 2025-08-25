import type { Media } from "../../media";
import type { Pagination } from "../../pagination";

export interface GetMediasDTO {
  page: number;
  perPage?: number;
}
export interface GetMediasResponse extends Pagination<Media> {}
