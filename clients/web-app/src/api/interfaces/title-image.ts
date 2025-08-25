import type { Extras } from "./extras";

export type TitleImageType =
  | "BANNER"
  | "POSTER"
  | "LOGO"
  | "OTHER"
  | "THUMBNAIL";

export interface TitleImageExtras {
  url: string;
}

export interface TitleImage extends Extras<TitleImageExtras> {
  id: string;
  titleId: string;
  width: number;
  height: number;
  key: string;
  type: TitleImageType;
  isProcessed: boolean;
  createdAt: string;
}
