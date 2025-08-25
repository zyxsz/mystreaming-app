import type { Profile } from "@/app/entities/profile.entity";
import { S3Service } from "../../services/s3.service";

const s3Service = new S3Service();

export class ProfilesPresenter {
  static toHttp(entity: Profile) {
    return {
      id: entity.id.toString(),
      userId: entity.userId,
      nickname: entity.nickname,
      tagline: entity.tagline,
      bio: entity.bio,

      avatar: entity.avatar,
      banner: entity.banner,

      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      avatarUrl: entity.avatar
        ? s3Service.getObjectFullUrl(entity.avatar)
        : undefined,
      bannerUrl: entity.banner
        ? s3Service.getObjectFullUrl(entity.banner)
        : undefined,
    };
  }
}
