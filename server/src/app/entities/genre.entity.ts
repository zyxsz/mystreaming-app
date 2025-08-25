import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface GenreProps {
  externalId: number;

  name: string | null;
  defaultLanguage: string | null;
}

export class Genre extends Entity<GenreProps> {
  public get externalId() {
    return this.props.externalId;
  }
  public get name() {
    return this.props.name;
  }
  public get defaultLanguage() {
    return this.props.defaultLanguage;
  }

  static create(props: GenreProps, id?: UniqueEntityID) {
    return new Genre(props, id);
  }
}
