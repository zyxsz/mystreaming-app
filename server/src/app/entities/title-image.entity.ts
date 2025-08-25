import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export type TitleImageType =
  | "BANNER"
  | "POSTER"
  | "LOGO"
  | "OTHER"
  | "THUMBNAIL";

export interface TitleImageProps {
  titleId: string | null;

  width: number;
  height: number | null;

  key: string;
  type: TitleImageType;

  isProcessed: boolean | null;

  createdAt: Date;
}

export class TitleImage extends Entity<TitleImageProps> {
  public get titleId() {
    return this.props.titleId;
  }
  public get width() {
    return this.props.width;
  }
  public get height() {
    return this.props.height;
  }
  public get key() {
    return this.props.key;
  }
  public get type() {
    return this.props.type;
  }
  public get isProcessed() {
    return this.props.isProcessed;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<TitleImageProps, "createdAt">,
    id?: UniqueEntityID
  ) {
    return new TitleImage(
      { ...props, createdAt: props.createdAt ?? new Date() },
      id
    );
  }
}
