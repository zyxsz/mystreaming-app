export type SeasonOrigin = "TMDB" | "IMDB" | "LOCAL";

export interface Season {
  id: string;
  titleId: string;
  number: number;
  name: string;
  overview: string;
  posterKey: string;
  airDate: string;
  rating: number;
  origin: SeasonOrigin;
  updatedAt: string;
  createdAt: string;
}
