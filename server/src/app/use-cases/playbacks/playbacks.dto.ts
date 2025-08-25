import type { Playback } from "@/app/entities/playback.entity";

export interface CreateDTO {
  mediaId: string;
}

export interface CreateResponse {
  token: string;
  playback: Playback;
}

export interface KeepAliveDTO {
  currentTime?: number;
}

export interface KeepAliveResponse {
  success: boolean;
}
