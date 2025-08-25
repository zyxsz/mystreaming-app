import type { Episode } from "../entities/episode.entity";

export abstract class EpisodesRepository {
  abstract findManyBySeasonId(seasonId: string): Promise<Episode[]>;

  abstract findFirstBySeasonIdAndNumber(
    seasonId: string,
    number: number
  ): Promise<Episode | null>;
}
