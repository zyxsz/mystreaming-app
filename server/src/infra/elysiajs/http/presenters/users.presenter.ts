import type { User } from "@/app/entities/user.entity";
import { ProfilesPresenter } from "./profiles.presenter";

export class UsersPresenter {
  static toHttp(entity: User) {
    return {
      id: entity.id.toValue(),
      username: entity.username,
      email: entity.email,
      role: entity.role,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,

      relations: entity.relations
        ? {
            profile: entity.relations.profile
              ? ProfilesPresenter.toHttp(entity.relations.profile)
              : undefined,
          }
        : undefined,
    };
  }
}
