import type { Genre } from "../entities/genre.entity";

export abstract class GenresRepository {
  abstract findManyToCollections(): Promise<Genre[]>;
}
