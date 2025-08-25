import type { TitleImage } from "@/app/entities/title-image.entity";
import { S3Service } from "../../services/s3.service";

const s3Service = new S3Service();

export class TitleImagesPresenter {
  static toHttp(entity: TitleImage) {
    return {
      id: entity.id.toString(),
      titleId: entity.titleId,
      width: entity.width,
      height: entity.height,
      key: entity.key,
      type: entity.type,
      isProcessed: entity.isProcessed,
      createdAt: entity.createdAt,

      extras: entity.key
        ? {
            url: s3Service.getObjectFullUrl(entity.key),
          }
        : undefined,
    };
  }
}
