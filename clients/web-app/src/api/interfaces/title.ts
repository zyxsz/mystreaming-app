import type { Extras } from "./extras";
import type { Relations } from "./relations";
import type { TitleImage } from "./title-image";

export type TitleOrigin = "TMDB" | "IMDB" | "LOCAL";
export type TitleType = "MOVIE" | "TV_SHOW";

export type TitleExtras = {
  bannerUrl: string;
  posterUrl: string;
};

export interface TitleRelations {
  images: TitleImage[];
}

export interface Title extends Extras<TitleExtras>, Relations<TitleRelations> {
  id: string;

  externalIdentifier: string | null;

  tmdbId: number | null;
  imdbId: string | null;

  name: string | null;
  overview: string | null;
  tagline: string | null;

  releaseDate: string | null;
  originalLanguage: string | null;

  popularity: number | null;
  rating: number | null;
  ratingCount: number | null;

  bannerKey: string | null;
  posterKey: string | null;

  origin: TitleOrigin;
  type: TitleType;

  updatedAt: string | null;
  createdAt: string;
}
