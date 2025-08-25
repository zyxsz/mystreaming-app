import type { Relations } from "./relations";
import type { Title } from "./title";

export type CollectionType = "GENRE";
export type CollectionImageType = "POSTER" | "BANNER";

export interface CollectionRelations {
  titles: Title[];
}

export interface Collection extends Relations<CollectionRelations> {
  id: string;
  externalId: string;
  name: string;
  type: CollectionType;
  imageType: CollectionImageType;
}
