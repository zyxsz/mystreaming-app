import type { Pagination } from "../../pagination";
import type { Playback } from "../../playback";

export interface GetMediaPlaybacksParams {
  page: number;
  perPage?: number;
}

export interface GetMediaPlaybacksResponse extends Pagination<Playback> {}
