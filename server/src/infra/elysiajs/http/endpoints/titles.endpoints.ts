import Elysia, { t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { TitlesUseCase } from "@/app/use-cases/titles/titles.use-case";
import { DrizzleTitlesRepository } from "../../database/repositories/drizzle.titles.repository";
import { database } from "../../database";
import { TitlesPresenter } from "../presenters/titles.presenter";
import { DrizzleMediaAssignsRepository } from "../../database/repositories/drizzle.media-assigns.repository";
import { MediaAssignPresenter } from "../presenters/media-assign-presenter";
import { DrizzleSeasonsRepository } from "../../database/repositories/drizzle.seasons.repository";
import { SeasonsPresenter } from "../presenters/seasons.presenter";
import { DrizzleEpisodesRepository } from "../../database/repositories/drizzle.episodes.repository";
import cors from "@elysiajs/cors";

const titlesRepository = new DrizzleTitlesRepository(database);
const mediaAssignsRepository = new DrizzleMediaAssignsRepository(database);
const seasonsRepository = new DrizzleSeasonsRepository(database);
const episodesRepository = new DrizzleEpisodesRepository(database);

const titlesUseCase = new TitlesUseCase(
  titlesRepository,
  mediaAssignsRepository,
  seasonsRepository,
  episodesRepository
);

export const TitlesEndpoints = new Elysia({
  prefix: "/titles",
})
  // .use(authMiddleware)

  .get(
    "/search",
    async ({ query: { query } }) => {
      const results = await titlesUseCase.search(query);

      return results.map((title) => TitlesPresenter.toHttp(title));
    },
    {
      query: t.Object({
        query: t.String(),
      }),
    }
  )
  .get(
    "/",
    async ({ query }) => {
      const result = await titlesUseCase.findManyWithPagination({
        page: query.page,
        perPage: query.perPage || 50,
        search: query.search,
      });

      return {
        data: result.data.map((title) => TitlesPresenter.toHttp(title)),
        pagination: result.pagination,
      };
    },
    {
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
        search: t.Optional(t.String()),
      }),
    }
  )

  .get(
    "/:titleId/media-assigns",
    async ({ params: { titleId }, query: { page, perPage } }) => {
      const results = await titlesUseCase.findManyMediaAssignsByTitleId({
        titleId,
        page,
        perPage: perPage || 25,
      });

      return {
        data: results.data.map((mediaAssign) =>
          MediaAssignPresenter.toHttp(mediaAssign)
        ),
        pagination: results.pagination,
      };
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
        search: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/:titleId/seasons",
    async ({ params: { titleId }, query: { page, perPage } }) => {
      const results =
        await titlesUseCase.findManySeasonsByTitleIdWithPagination({
          titleId,
          page,
          perPage: perPage || 25,
        });

      return {
        data: results.data.map((season) => SeasonsPresenter.toHttp(season)),
        pagination: results.pagination,
      };
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 999 })),
        search: t.Optional(t.String()),
      }),
    }
  )
  .get(
    "/:titleId/parse",
    async ({ params: { titleId }, query: { fileNames } }) => {
      console.log(titleId);

      const results = await titlesUseCase.parseFileNames(titleId, {
        fileNames,
      });

      return results;
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({
        fileNames: t.Array(t.String()),
      }),
    }
  )
  .get(
    "/:titleId",
    async ({ params: { titleId } }) => {
      const title = await titlesUseCase.findById(titleId);
      // console.log(request.headers, set.headers);

      return TitlesPresenter.toHttp(title);
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({}),
    }
  );
