import type { Relations } from "./relations";
import type { User } from "./user";

export type PlaybackStatus =
  | "CREATED"
  | "ALIVE"
  | "INACTIVE"
  | "EXPIRED"
  | "FINISHED"
  | "CLOSED";

export interface Playback extends Relations<{ user: User }> {
  id: string;
  userId: string | null;
  mediaId: string | null;

  currentTime: null | number;
  duration: null | number;

  status: PlaybackStatus;

  lastKeepAliveAt: string | null;
  expiresAt: string | null;

  updatedAt: string | null;
  createdAt: string;
}
