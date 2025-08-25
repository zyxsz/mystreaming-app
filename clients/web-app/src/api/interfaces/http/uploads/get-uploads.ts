import type { Pagination } from "../../pagination";
import type { Upload } from "../../upload";

export interface GetUploadsDTO {
  page: number;
  perPage?: number;
}
export interface GetUploadsResponse extends Pagination<Upload> {}
