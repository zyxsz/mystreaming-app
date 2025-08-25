import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { TitleImage } from "./title-image.entity";

export type TitleOrigin = "TMDB" | "IMDB" | "LOCAL";
export type TitleType = "MOVIE" | "TV_SHOW";

export interface TitleProps {
  externalIdentifier: string | null;

  tmdbId: number | null;
  imdbId: string | null;

  name: string | null;
  overview: string | null;
  tagline: string | null;

  releaseDate: Date | null;
  originalLanguage: string | null;

  popularity: number | null;
  rating: number | null;
  ratingCount: number | null;

  bannerKey: string | null;
  posterKey: string | null;

  origin: TitleOrigin;
  type: TitleType;

  updatedAt: Date | null;
  createdAt: Date;
}

export interface TitleRelations {
  images?: TitleImage[];
}

export class Title extends Entity<TitleProps, TitleRelations> {
  get externalIdentifier() {
    return this.props.externalIdentifier;
  }
  get tmdbId() {
    return this.props.tmdbId;
  }
  get imdbId() {
    return this.props.imdbId;
  }
  get name() {
    return this.props.name;
  }
  get overview() {
    return this.props.overview;
  }
  get tagline() {
    return this.props.tagline;
  }
  get releaseDate() {
    return this.props.releaseDate;
  }
  get originalLanguage() {
    return this.props.originalLanguage;
  }
  get popularity() {
    return this.props.popularity;
  }
  get rating() {
    return this.props.rating;
  }
  get ratingCount() {
    return this.props.ratingCount;
  }
  get bannerKey() {
    return this.props.bannerKey;
  }
  get posterKey() {
    return this.props.posterKey;
  }
  get origin() {
    return this.props.origin;
  }
  get type() {
    return this.props.type;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<TitleProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID,
    relations?: TitleRelations
  ) {
    return new Title(
      {
        ...props,
        updatedAt: props.updatedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
      relations
    );
  }
}
