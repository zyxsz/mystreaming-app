import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";
import type { Profile } from "./profile.entity";

export type UserRole = "ADMIN" | "MANAGER" | "MEMBER" | "USER";

export interface UserProps {
  username: string;
  email: string;
  password: string | null;
  role: UserRole;
  isEmailVerified: boolean | null;
  isFromExternalProvider: boolean | null;
  updatedAt: Date | null;
  createdAt: Date;
}

export interface UserRelations {
  profile: Profile;
}

export class User extends Entity<UserProps, UserRelations> {
  public get username() {
    return this.props.username;
  }
  public get email() {
    return this.props.email;
  }
  public get role() {
    return this.props.role;
  }
  public get isEmailVerified() {
    return this.props.isEmailVerified;
  }
  public get isFromExternalProvider() {
    return this.props.isFromExternalProvider;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  public get hasPassword() {
    return !!this.props.password;
  }

  public get password() {
    return this.props.password;
  }

  static create(
    props: Optional<UserProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID,
    relations?: Partial<UserRelations>
  ) {
    const entity = new User(
      {
        ...props,
        updatedAt: props.updatedAt ?? new Date(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
      relations
    );

    return entity;
  }
}
