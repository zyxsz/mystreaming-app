import type { TitleImagesRepository } from "@/app/repositories/title-images.repository";
import type { Database } from "..";
import type {
  TitleImageType,
  TitleImage,
} from "@/app/entities/title-image.entity";
import { titleImagesTable } from "../schemas/title-images";
import { DrizzleTitleImagesMapper } from "./mappers/drizzle.title-images.mapper";
import { and, eq } from "drizzle-orm";

export class DrizzleTitleImagesRepository implements TitleImagesRepository {
  constructor(private database: Database) {}

  async findFirstByTitleIdAndTypeAndSize(
    titleId: string,
    type: TitleImageType,
    size: number
  ): Promise<TitleImage | null> {
    const titleImage = await this.database
      .select()
      .from(titleImagesTable)
      .where(
        and(
          eq(titleImagesTable.titleId, titleId),
          eq(titleImagesTable.type, type),
          eq(titleImagesTable.width, size)
        )
      )
      .limit(1)
      .then((r) => r[0]);

    if (!titleImage) return null;

    return DrizzleTitleImagesMapper.toDomain(titleImage);
  }

  async save(titleImage: TitleImage): Promise<void> {
    await this.database
      .insert(titleImagesTable)
      .values(DrizzleTitleImagesMapper.toDrizzle(titleImage));
  }
}
