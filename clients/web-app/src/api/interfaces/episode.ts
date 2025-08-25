import type { Relations } from "./relations";

export type EpisodeOrigin = "TMDB" | "IMDB" | "LOCAL";

export interface EpisodeRelations {
  isAvailable: boolean;
}

export interface Episode extends Relations<EpisodeRelations> {
  id: string;

  seasonId: string | null;

  tmdbId: number | null;
  imdbId: string | null;

  number: number | null;

  name: string | null;
  overview: string | null;

  bannerKey: string | null;
  rating: number | null;

  airDate: string | null;
  origin: EpisodeOrigin | null;

  updatedAt: string | null;
  createdAt: string;
}
