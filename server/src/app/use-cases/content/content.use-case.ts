import { Collection } from "@/app/entities/app-level/collection.entity";
import type { Season } from "@/app/entities/season.entity";
import type { Title } from "@/app/entities/title.entity";
import { BadRequestError } from "@/app/errors/bad-request";
import { NotFoundError } from "@/app/errors/not-found";
import type { EpisodesRepository } from "@/app/repositories/episodes.repository";
import type { GenresRepository } from "@/app/repositories/genres.repository";
import type { SeasonsRepository } from "@/app/repositories/seasons.repository";
import type { TitlesRepository } from "@/app/repositories/titles.repository";
import type { ImagesService } from "@/app/services/images.service";
import { shuffle } from "@/infra/lib/shuffle";
import { mapLimit } from "async";

export class ContentUseCase {
  constructor(
    private titlesRepository: TitlesRepository,
    private seasonsRepository: SeasonsRepository,
    private episodesRepository: EpisodesRepository,
    private genresRepository: GenresRepository,
    private imagesService: ImagesService
  ) {}

  async findManyFeatured(): Promise<Title[]> {
    const titles = await this.titlesRepository.findManyFeatured();

    return titles;
  }

  async findTitleById(titleId: string): Promise<Title> {
    const title = await this.titlesRepository.findById(titleId);

    if (!title) throw new NotFoundError("Title not found");

    return title;
  }

  async findManyEpisodesByTitleId(titleId: string, seasonId?: string) {
    if (seasonId) {
      const season = await this.seasonsRepository.findById(seasonId);

      if (!season) throw new NotFoundError("Season not found");
      if (season.titleId !== titleId)
        throw new BadRequestError("Season don't belongs to title");

      const episodes = await this.episodesRepository.findManyBySeasonId(
        season.id.toString()
      );

      return episodes;
    }

    const firstSeason = await this.seasonsRepository.findFirstByTitleId(
      titleId
    );

    if (!firstSeason) throw new NotFoundError("No season found");

    const episodes = await this.episodesRepository.findManyBySeasonId(
      firstSeason.id.toString()
    );

    return episodes;
  }

  async findManySeasonsByTitleId(titleId: string): Promise<Season[]> {
    const seasons = await this.seasonsRepository.findManyByTitleId(titleId);

    return seasons;
  }

  async findManyCollections(): Promise<Collection[]> {
    const collectionsWithPoster = [2, 5, 9];

    const genres = await this.genresRepository.findManyToCollections();

    //shuffle(genres.slice(0, 10))

    const genresAsCollection = await Promise.all(
      shuffle(genres)
        .slice(0, 14)
        .map(async (genre, index) => {
          const collection = Collection.create(
            {
              externalId: genre.id.toString(),
              name: genre.name!,
              type: "GENRE",
              imageType: collectionsWithPoster.includes(index)
                ? "POSTER"
                : "BANNER",
            },
            undefined
          );

          const titles = await this.getCollectionContent(collection);

          collection.relations = { titles };

          return collection;
        })
    );

    const collections = [...genresAsCollection];

    return collections;
  }

  private async getCollectionContent(collection: Collection) {
    const imageSize = 512;

    if (collection.type === "GENRE") {
      const titles = await this.titlesRepository.findPopularManyByGenreId(
        collection.externalId,
        collection.imageType === "POSTER" ? "POSTER" : "BANNER",
        imageSize
      );

      await mapLimit(titles, 2, async (title: (typeof titles)[0]) => {
        if ((title.relations?.images?.length || 0) > 0) return;

        await this.imagesService.generateImage(
          title,
          collection.imageType === "POSTER" ? "POSTER" : "BANNER",
          imageSize
        );
      });

      return titles;
    }
  }
}
