import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { Profile } from "@/app/entities/profile.entity";
import type { profilesTable } from "../../schemas/profiles";

export class DrizzleProfilesMapper {
  static toDomain(data: InferSelectModel<typeof profilesTable>) {
    return Profile.create(
      {
        avatar: data.avatar,
        banner: data.banner,
        bio: data.bio,
        nickname: data.nickname,
        tagline: data.tagline,
        userId: data.userId?.toString(),
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
      },
      data.id ? new UniqueEntityID(data.id) : undefined
    );
  }

  static toDrizzle(entity: Profile) {
    return {
      id: entity.id.toValue(),
      userId: entity.userId,
      avatar: entity.avatar,
      banner: entity.banner,
      bio: entity.bio,
      createdAt: entity.createdAt,
      nickname: entity.nickname,
      tagline: entity.tagline,
      updatedAt: entity.updatedAt,
    } satisfies InferInsertModel<typeof profilesTable>;
  }
}
