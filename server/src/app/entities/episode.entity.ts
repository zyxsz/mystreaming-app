import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type EpisodeOrigin = "TMDB" | "IMDB" | "LOCAL";

export interface EpisodeProps {
  seasonId: string | null;

  tmdbId: number | null;
  imdbId: string | null;

  number: number | null;

  name: string | null;
  overview: string | null;

  bannerKey: string | null;
  rating: number | null;

  airDate: Date | null;
  origin: EpisodeOrigin | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export interface EpisodeRelations {
  isAvailable: boolean;
}

export class Episode extends Entity<EpisodeProps, EpisodeRelations> {
  get seasonId() {
    return this.props.seasonId;
  }
  get tmdbId() {
    return this.props.tmdbId;
  }
  get imdbId() {
    return this.props.imdbId;
  }
  get number() {
    return this.props.number;
  }
  get name() {
    return this.props.name;
  }
  get overview() {
    return this.props.overview;
  }
  get bannerKey() {
    return this.props.bannerKey;
  }
  get rating() {
    return this.props.rating;
  }
  get airDate() {
    return this.props.airDate;
  }
  get origin() {
    return this.props.origin;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<EpisodeProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID,
    relations?: Partial<EpisodeRelations>
  ) {
    return new Episode(
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
