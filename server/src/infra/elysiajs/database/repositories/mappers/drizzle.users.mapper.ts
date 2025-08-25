import type { InferSelectModel } from "drizzle-orm";
import type { usersTable } from "../../schemas/users";
import { User, type UserRelations } from "@/app/entities/user.entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export class DrizzleUsersMapper {
  static toDomain(
    data: InferSelectModel<typeof usersTable>,
    relations?: Partial<UserRelations>
  ) {
    return User.create(
      {
        email: data.email,
        isEmailVerified: data.isEmailVerified,
        isFromExternalProvider: data.isFromExternalProvider,
        password: data.password,
        role: data.role,
        username: data.username,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
      new UniqueEntityID(data.id),
      relations
    );
  }
}
