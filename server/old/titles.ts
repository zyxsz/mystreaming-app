import Elysia, { t } from 'elysia';
import { tmdbService } from 'mys-server/src/infra/elysiajs/http/services/tmdb';
import { authMiddleware } from 'mys-server/src/infra/elysiajs/http/middlewares/auth';
import { database } from '@/infra/database';
import {
  titlesRelations,
  titlesTable,
  type Title,
} from '@/infra/database/schemas/titles';
import { parseISO } from 'date-fns';
import { InternalServerError } from '../../app/errors/internal-server';
import { genresTable } from '@/infra/database/schemas/genres';
import { titlesToGenres } from '@/infra/database/schemas/titles-to-genres';
import { and, asc, desc, eq, gt, gte, sql } from 'drizzle-orm';
import { NotFoundError } from '../../app/errors/not-found';
import { BadRequestError } from '../../app/errors/bad-request';
import { getUserPermissions } from '@/infra/v1/app/auth';
import { UnauthorizedError } from '../../app/errors/unauthorized';
import { seasonsTable } from '@/infra/database/schemas/seasons';
import { episodesTable } from '@/infra/database/schemas/episodes';
import { titleImagesTable } from '@/infra/database/schemas/title-images';
import { mapLimit } from 'async';
import { shuffle } from '@/infra/lib/shuffle';
import { mediaAssignsTable } from '@/infra/database/schemas/media-assigns';
import { mediasTable } from '@/infra/database/schemas/medias';
import { progressTable } from '@/infra/database/schemas/progress';
import ytdl from 'ytdl-core';
import Stream from '@elysiajs/stream';

export const importTitle = async (body: {
  type: 'MOVIE' | 'TV_SHOW';
  origin: 'TMDB' | 'IMDB';
  id: string | number;
}) => {
  console.log(`Importing title ${body.id} from ${body.origin}`);

  if (body.type === 'MOVIE') {
    if (body.origin === 'TMDB') {
      const externalData = await tmdbService.movie.fetchDetails(body.id);

      const data = {
        externalIdentifier: `M_${externalData.id}`,
        name: externalData.original_title,
        tmdbId: externalData.id,
        overview: externalData.overview,
        origin: 'TMDB',
        type: 'MOVIE',
        popularity: externalData.popularity,
        rating: externalData.vote_average,
        ratingCount: externalData.vote_count,
        bannerKey: externalData.backdrop_path,
        posterKey: externalData.poster_path,
        imdbId: externalData.imdb_id,
        originalLanguage: externalData.original_language,
        releaseDate: externalData.release_date
          ? parseISO(externalData.release_date)
          : null,
        tagline: externalData.tagline,
      } as const;

      const title = await database
        .insert(titlesTable)
        .values(data)
        .onConflictDoUpdate({
          target: titlesTable.externalIdentifier,
          set: data,
        })
        .returning({
          id: titlesTable.id,
          tmdbId: titlesTable.tmdbId,
          imdbId: titlesTable.imdbId,
          name: titlesTable.name,
          overview: titlesTable.overview,
          tagline: titlesTable.tagline,
          releaseDate: titlesTable.releaseDate,
          originalLanguage: titlesTable.originalLanguage,
          popularity: titlesTable.popularity,
          rating: titlesTable.rating,
          ratingCount: titlesTable.ratingCount,
          bannerKey: titlesTable.bannerKey,
          posterKey: titlesTable.posterKey,
          type: titlesTable.type,
          updatedAt: titlesTable.updatedAt,
          createdAt: titlesTable.createdAt,
        })
        .then((result) => result[0] || null);

      if (!title)
        throw new InternalServerError('Unable to create title in database');

      const allGenres = externalData.genres.map((genre) => ({
        id: `M_${genre.id}`,
        externalId: genre.id,
        name: genre.name,
        defaultLanguage: tmdbService.defaultLanguage,
      }));

      if (allGenres.length > 0) {
        await database
          .insert(genresTable)
          .values(allGenres)
          .onConflictDoNothing({ target: genresTable.id })
          .returning({ id: genresTable.id });

        await database
          .insert(titlesToGenres)
          .values(
            allGenres.map((genre) => ({
              genreId: genre.id,
              titleId: title.id,
            })),
          )
          .onConflictDoNothing();
      }

      return title;
    }
  } else if (body.type === 'TV_SHOW') {
    if (body.origin === 'TMDB') {
      const externalData = await tmdbService.tv.fetchDetails(body.id);

      const data = {
        externalIdentifier: `TV_${externalData.id}`,
        name: externalData.original_name,
        tmdbId: externalData.id,
        overview: externalData.overview,
        origin: 'TMDB',
        type: 'TV_SHOW',
        popularity: externalData.popularity,
        rating: externalData.vote_average,
        ratingCount: externalData.vote_count,
        bannerKey: externalData.backdrop_path,
        posterKey: externalData.poster_path,
        originalLanguage: externalData.original_language,
        releaseDate: externalData.first_air_date
          ? parseISO(externalData.first_air_date)
          : null,
        tagline: externalData.tagline,
      } as const;

      const title = await database
        .insert(titlesTable)
        .values(data)
        .onConflictDoUpdate({
          target: titlesTable.externalIdentifier,
          set: data,
        })
        .returning({
          id: titlesTable.id,
          tmdbId: titlesTable.tmdbId,
          imdbId: titlesTable.imdbId,
          name: titlesTable.name,
          overview: titlesTable.overview,
          tagline: titlesTable.tagline,
          releaseDate: titlesTable.releaseDate,
          originalLanguage: titlesTable.originalLanguage,
          popularity: titlesTable.popularity,
          rating: titlesTable.rating,
          ratingCount: titlesTable.ratingCount,
          bannerKey: titlesTable.bannerKey,
          posterKey: titlesTable.posterKey,
          type: titlesTable.type,
          updatedAt: titlesTable.updatedAt,
          createdAt: titlesTable.createdAt,
        })
        .then((result) => result[0] || null);

      if (!title)
        throw new InternalServerError('Unable to create title in database');

      const allGenres = externalData.genres.map((genre) => ({
        id: `M_${genre.id}`,
        externalId: genre.id,
        name: genre.name,
        defaultLanguage: tmdbService.defaultLanguage,
      }));

      if (allGenres.length > 0) {
        await database
          .insert(genresTable)
          .values(allGenres)
          .onConflictDoNothing({ target: genresTable.id })
          .returning({ id: genresTable.id });

        await database
          .insert(titlesToGenres)
          .values(
            allGenres.map((genre) => ({
              genreId: genre.id,
              titleId: title.id,
            })),
          )
          .onConflictDoNothing();
      }

      const externalSeasons = await Promise.all(
        externalData.seasons.map((season) =>
          tmdbService.tv.fetchSeasonDetails(
            externalData.id,
            season.season_number,
          ),
        ),
      );

      if (externalSeasons.length > 0) {
        const seasons = await database
          .insert(seasonsTable)
          .values(
            externalSeasons.map((season) => {
              console.log('S', season.air_date);

              return {
                airDate: season.air_date ? parseISO(season.air_date) : null,
                posterKey: season.poster_path,
                name: season.name,
                overview: season.overview,
                number: season.season_number,
                origin: 'TMDB',
                rating: season.vote_average,
                tmdbId: season.id,
                titleId: title.id,
              } as const;
            }),
          )
          .returning({
            id: seasonsTable.id,
            tmdbId: seasonsTable.tmdbId,
            number: seasonsTable.number,
          })
          .onConflictDoUpdate({
            target: seasonsTable.tmdbId,
            set: {
              name: sql`excluded.name`,
            },
          });

        await Promise.all(
          seasons.map(async (season) => {
            const externalSeason = externalSeasons.find(
              (s) => s.id === season.tmdbId,
            );
            if (!externalSeason) return;

            if (externalSeason.episodes.length > 0) {
              await database
                .insert(episodesTable)
                .values(
                  externalSeason.episodes.map((episode) => {
                    console.log(episode.air_date);

                    return {
                      seasonId: season.id,
                      airDate: episode.air_date
                        ? parseISO(episode.air_date)
                        : null,
                      bannerKey: episode.still_path,
                      name: episode.name,
                      number: episode.episode_number,
                      origin: 'TMDB',
                      tmdbId: episode.id,
                      overview: episode.overview,
                      rating: episode.vote_average,
                    } as const;
                  }),
                )
                .onConflictDoNothing();
            }
          }),
        );
      }
      return title;
    }
  }
};

export const titlesRoutes = new Elysia({ prefix: '/titles' })
  .use(authMiddleware)
  .get(
    '/',
    async ({ query, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Title')) throw new UnauthorizedError();

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(titlesTable);
      const totalPages = Math.ceil(totalCount / pageSize);

      const titles = await database
        .select({
          id: titlesTable.id,
          tmdbId: titlesTable.tmdbId,
          imdbId: titlesTable.imdbId,
          name: titlesTable.name,
          overview: titlesTable.overview,
          tagline: titlesTable.tagline,
          releaseDate: titlesTable.releaseDate,
          originalLanguage: titlesTable.originalLanguage,
          popularity: titlesTable.popularity,
          rating: titlesTable.rating,
          ratingCount: titlesTable.ratingCount,
          bannerKey: titlesTable.bannerKey,
          posterKey: titlesTable.posterKey,
          type: titlesTable.type,
          updatedAt: titlesTable.updatedAt,
          createdAt: titlesTable.createdAt,
        })
        .from(titlesTable)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: titles,
        pagination: {
          size: pageSize,
          count: totalCount,
          pages: totalPages,
        },
      };
    },
    {
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
      }),
    },
  )
  .get(
    '/:titleId/genres',
    async ({ params: { titleId }, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Title')) throw new UnauthorizedError();

      const title = await database
        .select({ id: titlesTable.id })
        .from(titlesTable)
        .where(eq(titlesTable.id, titleId))
        .limit(1)
        .then((result) => result[0] || null);

      if (!title) throw new NotFoundError('Title not found');

      const titleGenres = await database
        .select()
        .from(titlesToGenres)
        .where(eq(titlesToGenres.titleId, titleId))
        .leftJoin(genresTable, eq(titlesToGenres.genreId, genresTable.id));

      return titleGenres.map((tg) => tg.genres);
    },
    {
      params: t.Object({ titleId: t.String({ format: 'uuid' }) }),
    },
  )
  .get(
    '/:titleId/seasons',
    async ({ params: { titleId }, query, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Title') || cannot('get', 'Season'))
        throw new UnauthorizedError();

      const title = await database
        .select({ id: titlesTable.id, type: titlesTable.type })
        .from(titlesTable)
        .where(eq(titlesTable.id, titleId))
        .limit(1)
        .then((result) => result[0] || null);

      if (!title) throw new NotFoundError('Title not found');
      if (title.type !== 'TV_SHOW')
        throw new BadRequestError('Title not a show');

      const page = query.page;
      const pageSize = query.perPage || 10;

      const totalCount = await database.$count(
        seasonsTable,
        eq(seasonsTable.titleId, title.id),
      );
      const totalPages = Math.ceil(totalCount / pageSize);

      const seasons = await database
        .select({
          id: seasonsTable.id,
          number: seasonsTable.number,
          name: seasonsTable.name,
          overview: seasonsTable.overview,
          posterKey: seasonsTable.posterKey,
          airDate: seasonsTable.airDate,
          rating: seasonsTable.rating,
          origin: seasonsTable.origin,
          updatedAt: seasonsTable.updatedAt,
          createdAt: seasonsTable.createdAt,
        })

        .from(seasonsTable)
        .where(eq(seasonsTable.titleId, title.id))
        .orderBy(asc(seasonsTable.number))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: seasons,
        pagination: {
          size: pageSize,
          count: totalCount,
          pages: totalPages,
        },
      };
    },
    {
      params: t.Object({ titleId: t.String({ format: 'uuid' }) }),
      query: t.Object({
        page: t.Numeric({ minimum: 1 }),
        perPage: t.Optional(t.Numeric({ minimum: 10, maximum: 100 })),
      }),
    },
  )
  .get(
    '/:titleId/watch',
    async ({ params: { titleId }, query, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Playback')) throw new UnauthorizedError();

      const title = await database
        .select({
          id: titlesTable.id,
          name: titlesTable.name,
          type: titlesTable.type,
        })
        .from(titlesTable)
        .where(eq(titlesTable.id, titleId))
        .limit(1)
        .then((result) => result[0] || null);

      if (!title) throw new NotFoundError('Title not found');

      const progress = await database
        .select({
          id: progressTable.id,
          episodeId: progressTable.episodeId,
          currentTime: progressTable.currentTime,
          totalDuration: progressTable.totalDuration,
          percentage: progressTable.percentage,
          completed: progressTable.completed,

          currentEpisode: {
            id: episodesTable.id,
            number: episodesTable.number,
            name: episodesTable.name,
            seasonNumber: seasonsTable.number,
            seasonId: episodesTable.seasonId,
          },
        })
        .from(progressTable)
        .where(
          and(
            eq(progressTable.titleId, title.id),
            eq(progressTable.userId, user.id),
          ),
        )
        .leftJoin(episodesTable, eq(episodesTable.id, progressTable.episodeId))
        .leftJoin(seasonsTable, eq(seasonsTable.id, episodesTable.seasonId))
        .orderBy(desc(progressTable.updatedAt))
        .limit(1)
        .then((res) => res[0] || null);

      if (title.type === 'MOVIE') {
      } else if (title.type === 'TV_SHOW') {
        if (query.episodeId) {
          const episode = await database
            .select({
              id: episodesTable.id,
              seasonId: episodesTable.seasonId,
              tmdbId: episodesTable.tmdbId,
              imdbId: episodesTable.imdbId,
              number: episodesTable.number,
              name: episodesTable.name,
              overview: episodesTable.overview,
              rating: episodesTable.rating,
              airDate: episodesTable.airDate,
              bannerKey: episodesTable.bannerKey,
              createdAt: episodesTable.createdAt,
              video: {
                mediaId: mediaAssignsTable.mediaId,
              },
            })
            .from(episodesTable)
            .where(eq(episodesTable.id, query.episodeId))
            .orderBy(asc(episodesTable.number))
            .innerJoin(
              mediaAssignsTable,
              eq(mediaAssignsTable.episodeId, episodesTable.id),
            )
            .limit(1)
            .then((r) => r[0]);

          if (!episode) throw new NotFoundError('Invalid episode');

          const season = await database
            .select({
              id: seasonsTable.id,
              titleId: seasonsTable.titleId,
              name: seasonsTable.name,
              overview: seasonsTable.overview,
              number: seasonsTable.number,
              airDate: seasonsTable.airDate,

              createdAt: seasonsTable.createdAt,
            })
            .from(seasonsTable)

            .where(eq(seasonsTable.id, episode.seasonId!))
            .orderBy(asc(seasonsTable.number))
            .limit(1)
            .then((res) => res[0]);

          if (!season) throw new NotFoundError('Season not found');

          const media = await database
            .select({
              id: mediasTable.id,
              name: mediasTable.name,
            })
            .from(mediasTable)
            .where(eq(mediasTable.id, episode.video?.mediaId!))
            .limit(1)
            .then((r) => r[0]);

          return {
            title,
            current: {
              videos: [media],
              episode: episode,
              season: season,
            },
          };
        }

        if (progress && progress.episodeId) {
          const episode = await database
            .select({
              id: episodesTable.id,
              seasonId: episodesTable.seasonId,
              tmdbId: episodesTable.tmdbId,
              imdbId: episodesTable.imdbId,
              number: episodesTable.number,
              name: episodesTable.name,
              overview: episodesTable.overview,
              rating: episodesTable.rating,
              airDate: episodesTable.airDate,
              bannerKey: episodesTable.bannerKey,
              createdAt: episodesTable.createdAt,
              video: {
                mediaId: mediaAssignsTable.mediaId,
              },
            })
            .from(episodesTable)
            .where(eq(episodesTable.id, progress.episodeId))
            .orderBy(asc(episodesTable.number))
            .innerJoin(
              mediaAssignsTable,
              eq(mediaAssignsTable.episodeId, episodesTable.id),
            )
            .limit(1)
            .then((r) => r[0]);

          const season = await database
            .select({
              id: seasonsTable.id,
              titleId: seasonsTable.titleId,
              name: seasonsTable.name,
              overview: seasonsTable.overview,
              number: seasonsTable.number,
              airDate: seasonsTable.airDate,

              createdAt: seasonsTable.createdAt,
            })
            .from(seasonsTable)

            .where(eq(seasonsTable.id, episode.seasonId!))
            .orderBy(asc(seasonsTable.number))
            .limit(1)
            .then((res) => res[0]);

          if (!season) throw new NotFoundError('Season not found');

          if (!episode) throw new NotFoundError('Show has no valid episodes');

          const media = await database
            .select({
              id: mediasTable.id,
              name: mediasTable.name,
            })
            .from(mediasTable)
            .where(eq(mediasTable.id, episode.video?.mediaId!))
            .limit(1)
            .then((r) => r[0]);

          return {
            title,
            current: {
              progress,
              videos: [media],
              episode: episode,
              season: season,
            },
          };
        }

        const firstSeason = await database
          .select({
            id: seasonsTable.id,
            titleId: seasonsTable.titleId,
            name: seasonsTable.name,
            overview: seasonsTable.overview,
            number: seasonsTable.number,
            airDate: seasonsTable.airDate,

            createdAt: seasonsTable.createdAt,
          })
          .from(seasonsTable)

          .where(
            and(gt(seasonsTable.number, 0), eq(seasonsTable.titleId, title.id)),
          )
          .orderBy(asc(seasonsTable.number))
          .limit(1)
          .then((res) => res[0]);

        if (!firstSeason) throw new NotFoundError('Show has no valid seasons');

        const firstEpisode = await database
          .select({
            id: episodesTable.id,
            tmdbId: episodesTable.tmdbId,
            imdbId: episodesTable.imdbId,
            number: episodesTable.number,
            name: episodesTable.name,
            overview: episodesTable.overview,
            rating: episodesTable.rating,
            airDate: episodesTable.airDate,
            bannerKey: episodesTable.bannerKey,
            createdAt: episodesTable.createdAt,

            videosCount: sql<number>`count(${mediaAssignsTable})`,

            video: {
              mediaId: mediaAssignsTable.mediaId,
            },
          })
          .from(episodesTable)
          .where(
            and(
              gt(episodesTable.number, 0),
              eq(episodesTable.seasonId, firstSeason.id),
            ),
          )
          .orderBy(asc(episodesTable.number))
          .innerJoin(
            mediaAssignsTable,
            eq(mediaAssignsTable.episodeId, episodesTable.id),
          )
          .groupBy(episodesTable.id, mediaAssignsTable.mediaId)
          .having(({ videosCount }) => gte(videosCount, 1))
          .limit(1)
          .then((r) => r[0]);

        if (!firstEpisode)
          throw new NotFoundError('Show has no valid episodes');

        const media = await database
          .select({
            id: mediasTable.id,
            name: mediasTable.name,
          })
          .from(mediasTable)
          .where(eq(mediasTable.id, firstEpisode.video?.mediaId!))
          .limit(1)
          .then((r) => r[0]);

        return {
          title,
          current: {
            videos: [media],
            episode: firstEpisode,
            season: firstSeason,
          },
        };
      }
    },
    {
      params: t.Object({ titleId: t.String({ format: 'uuid' }) }),
      query: t.Object({
        episodeId: t.Optional(t.String()),
      }),
    },
  )
  .post('/populate', async ({}) => {
    const titles = await database
      .select({
        id: titlesTable.id,
        tmdbId: titlesTable.tmdbId,
        type: titlesTable.type,
        name: titlesTable.name,
      })
      .from(titlesTable);

    const results = await mapLimit(
      shuffle(titles),
      2,
      async (title: (typeof titles)[0]) => {
        if (!title.tmdbId) return null;

        console.log(`Fetching recommendations for title: ${title.name}`);

        if (title.type === 'TV_SHOW') {
          const recommendations = await tmdbService.tv.fetchRecommendations(
            title.tmdbId,
          );

          return await mapLimit(
            recommendations.results,
            1,
            async (data: (typeof recommendations.results)[0]) => {
              return await importTitle({
                id: data.id,
                origin: 'TMDB',
                type: title.type,
              });
            },
          );
        } else if (title.type === 'MOVIE') {
          const recommendations = await tmdbService.movie.fetchRecommendations(
            title.tmdbId,
          );

          return await mapLimit(
            recommendations.results,
            1,
            async (data: (typeof recommendations.results)[0]) => {
              return await importTitle({
                id: data.id,
                origin: 'TMDB',
                type: title.type,
              });
            },
          );
        }
      },
    );

    return results;
  })
  .post(
    '/import',
    async ({ body, user }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('create', 'Title')) throw new UnauthorizedError();

      const result = await importTitle(body);

      if (result) return result;

      throw new BadRequestError('Provider not implemented');
    },
    {
      body: t.Object({
        id: t.Union([t.String(), t.Numeric()]),
        type: t.Union([t.Literal('MOVIE'), t.Literal('TV_SHOW')]),
        origin: t.Union([t.Literal('TMDB'), t.Literal('IMDB')]),
      }),
    },
  )
  .get(
    '/:titleId/banner',
    async ({ params: { titleId } }) => {
      const size = 512;

      const image = await database
        .select()
        .from(titleImagesTable)
        .where(
          and(
            eq(titleImagesTable.titleId, titleId),
            eq(titleImagesTable.type, 'BANNER'),
            eq(titleImagesTable.width, size),
          ),
        )
        .limit(1)
        .then((result) => result[0] || null);

      if (image) {
        return;
      }
    },
    {
      params: t.Object({
        titleId: t.String({ format: 'uuid' }),
      }),
    },
  )
  .get(
    ':titleId/trailer',
    async ({ params, user, set }) => {
      const { cannot } = getUserPermissions(user.id, user.role);

      if (cannot('get', 'Title') || cannot('get', 'Season'))
        throw new UnauthorizedError();

      const title = await database
        .select({
          id: titlesTable.id,
          tmdbId: titlesTable.tmdbId,
          type: titlesTable.type,
        })
        .from(titlesTable)
        .where(eq(titlesTable.id, params.titleId))
        .limit(1)
        .then((result) => result[0] || null);

      if (!title) throw new NotFoundError('Title not found');

      if (title.type === 'TV_SHOW') {
        const videos = await tmdbService.tv.fetchVideos(title.tmdbId!);

        const video = videos[0];

        if (!video) return;

        const str = new Stream();

        const stream = ytdl(video.key).on('data', (data) => {
          str.send(data);
        });

        set.headers['content-type'] = 'video/mp4';
        set.headers['content-length'] = '999999';
        set.status = 206;

        return str;
      }
    },
    {
      params: t.Object({
        titleId: t.String({ format: 'uuid' }),
      }),
    },
  );
