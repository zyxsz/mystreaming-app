import type { TitleImageType } from "../entities/title-image.entity";
import type { Title } from "../entities/title.entity";

export abstract class ImagesService {
  abstract generateImage(
    title: Title,
    imageType: TitleImageType,
    size: number
  ): Promise<void>;
}
