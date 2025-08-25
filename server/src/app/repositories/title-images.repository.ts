import type {
  TitleImage,
  TitleImageType,
} from "../entities/title-image.entity";

export abstract class TitleImagesRepository {
  abstract findFirstByTitleIdAndTypeAndSize(
    titleId: string,
    type: TitleImageType,
    size: number
  ): Promise<TitleImage | null>;

  abstract save(titleImage: TitleImage): Promise<void>;
}
