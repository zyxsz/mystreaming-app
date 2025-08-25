import { Entity } from "@/core/entities/entity";
import type { UniqueEntityID } from "@/core/entities/unique-entity-id";
import type { Optional } from "@/core/types/optional";

export interface ProfileProps {
  userId: string;

  avatar: string | null;
  banner: string | null;

  nickname: string | null;
  tagline: string | null;

  bio: string | null;

  updatedAt: Date | null;
  createdAt: Date;
}

export class Profile extends Entity<ProfileProps> {
  public get userId() {
    return this.props.userId;
  }
  public get avatar() {
    return this.props.avatar;
  }
  public get banner() {
    return this.props.banner;
  }
  public get nickname() {
    return this.props.nickname;
  }
  public get tagline() {
    return this.props.tagline;
  }
  public get bio() {
    return this.props.bio;
  }
  public get updatedAt() {
    return this.props.updatedAt;
  }
  public get createdAt() {
    return this.props.createdAt;
  }

  static create(
    props: Optional<ProfileProps, "updatedAt" | "createdAt">,
    id?: UniqueEntityID
  ) {
    return new Profile(
      {
        ...props,
        updatedAt: props.updatedAt ?? null,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    );
  }
}
