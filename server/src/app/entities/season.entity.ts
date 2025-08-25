import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type SeasonOrigin = "TMDB" | "IMDB" | "LOCAL";

export interface SeasonProps {
  titleId: string | null;

  tmdbId: number | null;

  number: number | null;

  name: string | null;
  overview: string | null;

  posterKey: string | null;
  airDate: Date | null;

  rating: number | null;
  origin: SeasonOrigin | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export class Season extends Entity<SeasonProps> {
  public get titleId() {
    return this.props.titleId;
  }
  public get tmdbId() {
    return this.props.tmdbId;
  }
  public get number() {
    return this.props.number;
  }
  public get name() {
    return this.props.name;
  }
  public get overview() {
    return this.props.overview;
  }
  public get posterKey() {
    return this.props.posterKey;
  }
  public get airDate() {
    return this.props.airDate;
  }
  public get rating() {
    return this.props.rating;
  }
  public get origin() {
    return this.props.origin;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<SeasonProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID
  ) {
    return new Season(
      {
        ...props,
        updatedAt: props.updatedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
  }
}
