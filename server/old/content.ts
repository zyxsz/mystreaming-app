import { database } from '@/infra/database';
import { genresTable } from '@/infra/database/schemas/genres';
import { titlesTable } from '@/infra/database/schemas/titles';
import { titlesToGenres } from '@/infra/database/schemas/titles-to-genres';
import { shuffle } from '@/infra/lib/shuffle';
import { generateUUID } from '@/infra/lib/uuid';
import { mapLimit } from 'async';
import axios from 'axios';
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  isNotNull,
  or,
  sql,
} from 'drizzle-orm';
import Elysia, { t } from 'elysia';
import { BadRequestError } from '../../app/errors/bad-request';
import { NotFoundError } from '../../app/errors/not-found';
import { titleImagesTable } from '@/infra/database/schemas/title-images';
import { tmdbService } from 'mys-server/src/infra/elysiajs/http/services/tmdb';
import {
  generateBanner,
  generateTitleBanner,
} from 'mys-server/src/infra/elysiajs/http/services/images';
import {
  generateGetPresignedUrl,
  getObjectUrl,
} from 'mys-server/src/infra/elysiajs/http/services/storage';
import { seasonsTable } from '@/infra/database/schemas/seasons';
import { episodesTable } from '@/infra/database/schemas/episodes';
import { mediaAssignsTable } from '@/infra/database/schemas/media-assigns';
import { progressTable } from '@/infra/database/schemas/progress';
import { authMiddleware } from 'mys-server/src/infra/elysiajs/http/middlewares/auth';

type CollectionType = 'GENRE' | 'PERSONAL';

type Collection = {
  id: string;
  externalId: string;
  name: string;
  type: CollectionType;
};

const getCollectionContent = async ({
  size,
  type,
  externalId,
  imageType,
}: {
  size?: number;
  type: 'GENRE';
  externalId: string;
  imageType: 'BANNER' | 'POSTER';
}) => {
  const bannerSize = size || 512;

  if (type === 'GENRE') {
    const titles = await database
      .select({
        id: titlesTable.id,
        name: titlesTable.name,
        tagline: titlesTable.tagline,
        overview: titlesTable.overview,
        rating: titlesTable.rating,
        bannerKey: titlesTable.bannerKey,
        posterKey: titlesTable.posterKey,
        releaseDate: titlesTable.releaseDate,
        image: {
          id: titleImagesTable.id,
          key: titleImagesTable.key,
        },
        tmdbId: titlesTable.tmdbId,
        type: titlesTable.type,
        seasonCount: database.$count(
          seasonsTable,
          eq(seasonsTable.titleId, titlesTable.id),
        ),
      })
      .from(titlesToGenres)
      .where(eq(titlesToGenres.genreId, externalId))
      .innerJoin(
        titlesTable,
        and(
          eq(titlesTable.id, titlesToGenres.titleId),
          gte(titlesTable.ratingCount, 100),
          isNotNull(titlesTable.bannerKey),
          isNotNull(titlesTable.name),
        ),
      )
      .leftJoin(
        titleImagesTable,
        and(
          eq(titleImagesTable.titleId, titlesTable.id),
          eq(titleImagesTable.type, imageType),
          eq(titleImagesTable.width, bannerSize),
        ),
      )
      .orderBy(desc(titlesTable.popularity))
      .limit(40);

    const titlesShuffled = shuffle(titles.slice(0, 15));

    const titlesWithGeneratedBanners = (
      await Promise.all(
        titlesShuffled.map(async (title) => {
          if (!title.tmdbId || !title.bannerKey || !title.posterKey)
            return null;
          if (title.image)
            return {
              ...title,
              image: {
                ...title.image,
                url: getObjectUrl(title.image.key),
              },
            };

          //ad

          // await generateTitleBanner({
          //   title: {
          //     id: title.id,
          //     bannerKey: title.bannerKey,
          //     tmdbId: title.tmdbId,
          //     type: title.type,
          //   },
          //   bannerSize,
          //   type: imageType,
          // });

          return {
            ...title,
            image: {
              id: generateUUID(),
              key: imageType === 'BANNER' ? title.bannerKey : title.posterKey,
              url: tmdbService.assets.getFullUrl(
                imageType === 'BANNER' ? title.bannerKey : title.posterKey,
                'w500',
              ),
            },
          };
        }),
      )
    ).filter((value) => value !== null);

    const titlesReduced = Object.values(
      titlesWithGeneratedBanners.reduce<
        Record<
          string,
          {
            id: string;
            name: string | null;
            rating: number | null;
            tagline: string | null;
            overview: string | null;
            seasonCount?: number;
            releaseDate?: string;
            images: {
              id: string;
              key: string;
            }[];
            type: 'MOVIE' | 'TV_SHOW';
          }
        >
      >((acc, row) => {
        const image = row.image;
        if (!acc[row.id]) {
          acc[row.id] = {
            id: row.id,
            name: row.name,
            rating: row.rating,
            overview: row.overview,
            tagline: row.tagline,
            seasonCount: row.type === 'TV_SHOW' ? row.seasonCount : undefined,
            releaseDate: row.releaseDate?.toISOString(),
            images: [],
            type: row.type,
          };
        }
        if (image) {
          acc[row.id].images.push(image);
        }
        return acc;
      }, {}),
    );

    return titlesReduced;
  }

  throw new NotFoundError('Collection not found');
};

const collectionRoutes = new Elysia({ prefix: '/collections' })
  .get('/', async ({}) => {
    const collectionsWithPoster = [2, 5, 9];

    const genres = await database
      .select({
        id: genresTable.id,
        name: genresTable.name,
        titlesCount: count(titlesTable.id),
      })
      .from(genresTable)
      .leftJoin(titlesToGenres, eq(titlesToGenres.genreId, genresTable.id))
      .leftJoin(
        titlesTable,
        and(
          eq(titlesToGenres.titleId, titlesTable.id),
          gte(titlesTable.ratingCount, 100),
          isNotNull(titlesTable.bannerKey),
        ),
      )
      .groupBy(genresTable.id)
      .having(({ titlesCount }) => gte(titlesCount, 30))
      .orderBy(desc(count(titlesTable.id)))
      .limit(20);

    const genresAsCollections = shuffle(genres.slice(0, 10)).map(
      (genre) =>
        ({
          id: `GENRE_${generateUUID()}`,
          externalId: genre.id,
          name: genre.name as string,
          type: 'GENRE',
        }) satisfies Collection,
    );

    const collections = [...genresAsCollections].map((collection, index) => {
      if (collectionsWithPoster.includes(index))
        return { ...collection, imageType: 'POSTER' };

      return { ...collection, imageType: 'BANNER' };
    });

    return await Promise.all(
      collections.map(async (collection) => ({
        ...collection,
        content: await getCollectionContent({
          type: collection.type,
          externalId: collection.externalId,
          imageType: collection.imageType as 'POSTER' | 'BANNER',
        }),
      })),
    );
  })
  .get(
    '/:collectionId',
    async ({ query: { externalId, type, size, imageType } }) => {
      const bannerSize = size || 512;

      if (type === 'GENRE') {
        const titles = await database
          .select({
            id: titlesTable.id,
            name: titlesTable.name,
            tagline: titlesTable.tagline,
            overview: titlesTable.overview,
            rating: titlesTable.rating,
            bannerKey: titlesTable.bannerKey,
            posterKey: titlesTable.posterKey,
            releaseDate: titlesTable.releaseDate,
            image: {
              id: titleImagesTable.id,
              key: titleImagesTable.key,
            },
            tmdbId: titlesTable.tmdbId,
            type: titlesTable.type,
            seasonCount: database.$count(
              seasonsTable,
              eq(seasonsTable.titleId, titlesTable.id),
            ),
          })
          .from(titlesToGenres)
          .where(and(eq(titlesToGenres.genreId, externalId)))
          .innerJoin(
            titlesTable,
            and(
              eq(titlesTable.id, titlesToGenres.titleId),
              gte(titlesTable.ratingCount, 100),
              isNotNull(titlesTable.bannerKey),
              isNotNull(titlesTable.name),
            ),
          )
          .leftJoin(
            titleImagesTable,
            and(
              eq(titleImagesTable.titleId, titlesTable.id),
              eq(titleImagesTable.type, imageType),
              eq(titleImagesTable.width, bannerSize),
            ),
          )
          .orderBy(desc(titlesTable.rating))
          .limit(40);

        const titlesWithGeneratedBanners = (
          await mapLimit(titles, 1, async (title: (typeof titles)[0]) => {
            if (!title.tmdbId || !title.bannerKey || !title.posterKey)
              return null;
            if (title.image)
              return {
                ...title,
                image: {
                  ...title.image,
                  url: await generateGetPresignedUrl(title.image.key),
                },
              };

            //ad

            await generateTitleBanner({
              title: {
                id: title.id,
                bannerKey: title.bannerKey,
                tmdbId: title.tmdbId,
                type: title.type,
              },
              bannerSize,
              type: imageType,
            });

            return {
              ...title,
              image: {
                id: generateUUID(),
                key: imageType === 'BANNER' ? title.bannerKey : title.posterKey,
                url: tmdbService.assets.getFullUrl(
                  imageType === 'BANNER' ? title.bannerKey : title.posterKey,
                  'w500',
                ),
              },
            };
          })
        ).filter((value) => value !== null);

        const titlesReduced = Object.values(
          shuffle(titlesWithGeneratedBanners)
            .slice(0, 15)
            .reduce<
              Record<
                string,
                {
                  id: string;
                  name: string | null;
                  rating: number | null;
                  tagline: string | null;
                  overview: string | null;
                  seasonCount?: number;
                  releaseDate?: string;
                  images: {
                    id: string;
                    key: string;
                  }[];
                }
              >
            >((acc, row) => {
              const image = row.image;
              if (!acc[row.id]) {
                acc[row.id] = {
                  id: row.id,
                  name: row.name,
                  rating: row.rating,
                  overview: row.overview,
                  tagline: row.tagline,
                  seasonCount:
                    row.type === 'TV_SHOW' ? row.seasonCount : undefined,
                  releaseDate: row.releaseDate?.toISOString(),

                  images: [],
                };
              }
              if (image) {
                acc[row.id].images.push(image);
              }
              return acc;
            }, {}),
        );

        return titlesReduced;
      }

      throw new NotFoundError('Collection not found');
    },
    {
      params: t.Object({
        collectionId: t.String(),
      }),
      query: t.Object({
        externalId: t.String(),
        type: t.Union([t.Literal('GENRE'), t.Literal('PERSONAL')]),
        imageType: t.Union([t.Literal('POSTER'), t.Literal('BANNER')]),
        size: t.Optional(t.Union([t.Literal(512)])),
      }),
    },
  );

const titleRoutes = new Elysia({ prefix: '/titles' })
  .use(authMiddleware)
  .get(
    '/:titleId/genres',
    async ({ params: { titleId } }) => {
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
      params: t.Object({
        titleId: t.String({ format: 'uuid' }),
      }),
    },
  )
  .get(
    '/:titleId',
    async ({ params }) => {
      const title = await database
        .select({
          id: titlesTable.id,
          tmdbId: titlesTable.tmdbId,
          imdbId: titlesTable.imdbId,
          name: titlesTable.name,
          overview: titlesTable.overview,

          tagline: titlesTable.tagline,
          firstAirDate: titlesTable.releaseDate,
          bannerKey: titlesTable.bannerKey,
          posterKey: titlesTable.posterKey,

          originLanguage: titlesTable.originalLanguage,
          rating: titlesTable.rating,
          ratingCount: titlesTable.ratingCount,
          type: titlesTable.type,
          popularity: titlesTable.popularity,
        })
        .from(titlesTable)
        .where(eq(titlesTable.id, params.titleId))
        .limit(1)
        .then((res) => res[0] || null);

      if (!title) throw new NotFoundError('Title not found');

      return title;
    },
    { params: t.Object({ titleId: t.String() }) },
  )
  .get(
    '/:titleId/progress',
    async ({ params, user }) => {
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
          },
        })
        .from(progressTable)
        .where(
          and(
            eq(progressTable.titleId, params.titleId),
            eq(progressTable.userId, user.id),
          ),
        )
        .leftJoin(episodesTable, eq(episodesTable.id, progressTable.episodeId))
        .leftJoin(seasonsTable, eq(seasonsTable.id, episodesTable.seasonId))
        .orderBy(desc(progressTable.updatedAt))

        .limit(1)
        .then((res) => res[0] || null);

      if (!progress) throw new NotFoundError('Progress not found');

      return progress;
    },
    { params: t.Object({ titleId: t.String() }) },
  )
  .get(
    '/:titleId/episodes',
    async ({ params, query, user }) => {
      if (query.seasonId) {
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
          .where(eq(seasonsTable.id, query.seasonId))
          .limit(1)
          .then((res) => res[0]);

        if (!season) throw new NotFoundError('Season not found');

        if (season.titleId !== params.titleId)
          throw new BadRequestError('Invalid season');

        const episodes = await database
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
            isAvailable: sql`count(${mediaAssignsTable}) >= 1`,
            currentProgress: {
              id: progressTable.id,
              episodeId: progressTable.episodeId,
              currentTime: progressTable.currentTime,
              totalDuration: progressTable.totalDuration,
              percentage: progressTable.percentage,
              completed: progressTable.completed,
            },
          })
          .from(episodesTable)
          .where(eq(episodesTable.seasonId, season.id))
          .leftJoin(
            mediaAssignsTable,
            eq(mediaAssignsTable.episodeId, episodesTable.id),
          )
          .leftJoin(
            progressTable,
            and(
              eq(progressTable.episodeId, episodesTable.id),
              eq(progressTable.userId, user.id),
            ),
          )
          .groupBy(episodesTable.id, progressTable.id)
          .orderBy(asc(episodesTable.number));

        return episodes;
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
          and(
            gt(seasonsTable.number, 0),
            eq(seasonsTable.titleId, params.titleId),
          ),
        )
        .orderBy(asc(seasonsTable.number))
        .limit(1)
        .then((res) => res[0]);

      if (!firstSeason) throw new NotFoundError('Season not found');

      const episodes = await database
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
          isAvailable: sql`count(${mediaAssignsTable}) >= 1`,
          currentProgress: {
            id: progressTable.id,
            episodeId: progressTable.episodeId,
            currentTime: progressTable.currentTime,
            totalDuration: progressTable.totalDuration,
            percentage: progressTable.percentage,
            completed: progressTable.completed,
          },
        })
        .from(episodesTable)
        .where(eq(episodesTable.seasonId, firstSeason.id))
        .leftJoin(
          mediaAssignsTable,
          eq(mediaAssignsTable.episodeId, episodesTable.id),
        )
        .leftJoin(
          progressTable,
          and(
            eq(progressTable.episodeId, episodesTable.id),
            eq(progressTable.userId, user.id),
          ),
        )
        .groupBy(episodesTable.id, progressTable.id)
        .orderBy(asc(episodesTable.number));

      return episodes;

      /*
      

    const progress = await this.progressRepository.findBy(
      {
        userId: request.userId,
        titleId: request.titleId,
      },
      true,
    );

    if (progress?.episodeId) {
      const currentEpisode = await this.episodesRepository.findById(
        progress.episodeId?.toString(),
      );

      if (!currentEpisode) throw new Error('Episode not found');

      const currentSeason = await this.seasonsRepository.findById(
        currentEpisode.seasonId.toString(),
      );

      if (!currentSeason) throw new Error('S not found');

      const episodes = await this.episodesRepository.findManyBySeasonId(
        currentSeason.id.toString(),
        { userId: request.userId },
      );

      return {
        episodes: episodes,
      };
    }

    const firstSeason = await this.seasonsRepository.findFirstByTitleId(
      request.titleId,
    );

    if (!firstSeason) throw new NotFoundError('Season not found');

    const episodes = await this.episodesRepository.findManyBySeasonId(
      firstSeason.id.toString(),
      { userId: request.userId },
    );

    return {
      episodes: episodes,
    };
    */
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
      query: t.Object({
        seasonId: t.Optional(t.String()),
      }),
    },
  )
  .get(
    '/:titleId/seasons',
    async ({ params }) => {
      const seasons = await database
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
          and(
            gt(seasonsTable.number, 0),
            eq(seasonsTable.titleId, params.titleId),
          ),
        )
        .orderBy(asc(seasonsTable.number));

      return seasons;
    },
    {
      params: t.Object({
        titleId: t.String(),
      }),
    },
  );

export const contentRoutes = new Elysia({ prefix: '/content' })
  .use(collectionRoutes)
  .use(titleRoutes)
  .use(authMiddleware)
  .get(
    '/featured',
    async ({}) => {
      // const count = await database.c

      const titles = await database
        .select({
          id: titlesTable.id,
          name: titlesTable.name,
          overview: titlesTable.overview,
          tagline: titlesTable.tagline,
          releaseDate: titlesTable.releaseDate,
          rating: titlesTable.rating,
          bannerKey: titlesTable.bannerKey,
          originalLanguage: titlesTable.originalLanguage,
          type: titlesTable.type,
        })
        .from(titlesTable)
        .where(
          and(
            gte(titlesTable.ratingCount, 200),
            isNotNull(titlesTable.bannerKey),
          ),
        )
        .orderBy(desc(titlesTable.popularity), desc(titlesTable.rating))
        .limit(35);

      const featuredTitles = shuffle(titles).slice(0, 8);

      return featuredTitles.map((title) => ({
        ...title,
        bannerUrl: `https://image.tmdb.org/t/p/w1920${title.bannerKey}`,
      }));
    },
    {
      response: t.Array(
        t.Object({
          id: t.String(),
          name: t.Nullable(t.String()),
          overview: t.Nullable(t.String()),
          tagline: t.Nullable(t.String()),
          releaseDate: t.Nullable(t.Date()),
          rating: t.Nullable(t.Numeric()),
          bannerKey: t.Nullable(t.Nullable(t.Optional(t.String()))),
          originalLanguage: t.Nullable(t.String()),
          type: t.Union([t.Literal('MOVIE'), t.Literal('TV_SHOW')]),
          bannerUrl: t.String(),
        }),
      ),
    },
  )
  .get(
    '/search',
    async ({ query: { query } }) => {
      console.log(query);

      const titles = await database
        .select({
          id: titlesTable.id,
          name: titlesTable.name,
          overview: titlesTable.overview,
          bannerKey: titlesTable.bannerKey,
          image: {
            id: titleImagesTable.id,
            key: titleImagesTable.key,
          },
          type: titlesTable.type,
        })
        .from(titlesTable)
        .where(
          or(
            ilike(titlesTable.name, `%${query}%`),
            ilike(titlesTable.overview, `%${query}%`),
            // ilike(titlesTable.tagline, `${query}`)
          ),
        )
        .leftJoin(
          titleImagesTable,
          and(
            eq(titleImagesTable.titleId, titlesTable.id),
            eq(titleImagesTable.type, 'BANNER'),
          ),
        )
        // .orderBy(desc(titlesTable.rating))
        .limit(10);

      return await Promise.all(
        titles.map(async (title) => {
          if (title.image) {
            return {
              ...title,
              image: undefined,
              images: [
                {
                  ...title.image,
                  url: await generateGetPresignedUrl(title.image.key),
                },
              ],
            };
          } else {
            if (!title.bannerKey) return title;

            return {
              ...title,
              images: [
                {
                  id: `EXTERNAL`,
                  key: title.bannerKey,
                  url: tmdbService.assets.getFullUrl(title.bannerKey, 'w500'),
                },
              ],
            };
          }
        }),
      );
    },
    {
      query: t.Object({ query: t.String() }),
    },
  );
