import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Title } from "../title.entity";

export type CollectionType = "GENRE";
export type CollectionImageType = "POSTER" | "BANNER";

export interface CollectionProps {
  name: string;
  externalId: string;
  type: CollectionType;
  imageType: CollectionImageType | null;
}

export interface CollectionRelations {
  titles: Title[];
}

export class Collection extends Entity<CollectionProps, CollectionRelations> {
  public get name() {
    return this.props.name;
  }

  public get externalId() {
    return this.props.externalId;
  }

  public get type() {
    return this.props.type;
  }

  public get imageType() {
    return this.props.imageType;
  }

  static create(
    props: CollectionProps,
    id?: UniqueEntityID,
    relations?: CollectionRelations
  ) {
    return new Collection(props, id, relations);
  }
}
