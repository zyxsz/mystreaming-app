import Elysia, { t } from "elysia";
import { DrizzleTitlesRepository } from "../../database/repositories/drizzle.titles.repository";
import { database } from "../../database";
import { ContentUseCase } from "@/app/use-cases/content/content.use-case";
import { authMiddleware } from "../middlewares/auth";
import { TitlesPresenter } from "../presenters/titles.presenter";
import { DrizzleSeasonsRepository } from "../../database/repositories/drizzle.seasons.repository";
import { DrizzleEpisodesRepository } from "../../database/repositories/drizzle.episodes.repository";
import { EpisodePresenter } from "../presenters/episode.presenter";
import { DrizzleGenresRepository } from "../../database/repositories/drizzle.genres.repository";
import { CollectionsPresenter } from "../presenters/collections.presenter";
import { DrizzleTitleImagesRepository } from "../../database/repositories/drizzle.title-images.repository";
import { LocalImageService } from "../../services/local-image.service";
import { JWTService } from "../../services/jwt.service";
import { StorageService } from "@/app/services/storage.service";
import { S3Service } from "../../services/s3.service";
import { SeasonsPresenter } from "../presenters/seasons.presenter";

const titlesRepository = new DrizzleTitlesRepository(database);
const seasonsRepository = new DrizzleSeasonsRepository(database);
const episodesRepository = new DrizzleEpisodesRepository(database);
const genresRepository = new DrizzleGenresRepository(database);
const titleImagesRepository = new DrizzleTitleImagesRepository(database);

const jwtService = new JWTService();
const s3Service = new S3Service();

const localImageService = new LocalImageService(
  titleImagesRepository,
  jwtService,
  s3Service
);

const contentUseCase = new ContentUseCase(
  titlesRepository,
  seasonsRepository,
  episodesRepository,
  genresRepository,
  localImageService
);

const TitlesEndpoints = new Elysia({ prefix: "/titles" })
  .get("/featured", async ({}) => {
    const titles = await contentUseCase.findManyFeatured();

    return titles.map((title) => TitlesPresenter.toHttp(title));
  })
  .get(
    "/:titleId",
    async ({ params: { titleId } }) => {
      const title = await contentUseCase.findTitleById(titleId);

      return TitlesPresenter.toHttp(title);
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
    }
  )
  .get(
    "/:titleId/episodes",
    async ({ params: { titleId }, query: { seasonId } }) => {
      const episodes = await contentUseCase.findManyEpisodesByTitleId(
        titleId,
        seasonId
      );

      return episodes.map((episode) => EpisodePresenter.toHttp(episode));
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({
        seasonId: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/:titleId/seasons",
    async ({ params: { titleId } }) => {
      const seasons = await contentUseCase.findManySeasonsByTitleId(titleId);

      return seasons.map((season) => SeasonsPresenter.toHttp(season));
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
    }
  );

const CollectionsEndpoints = new Elysia({ prefix: "/collections" }).get(
  "/",
  async ({}) => {
    const collections = await contentUseCase.findManyCollections();

    return collections.map((collection) =>
      CollectionsPresenter.toHttp(collection)
    );
  }
);

export const ContentEndpoints = new Elysia({
  prefix: "/content",
})
  .use(authMiddleware)
  .use(TitlesEndpoints)
  .use(CollectionsEndpoints);
