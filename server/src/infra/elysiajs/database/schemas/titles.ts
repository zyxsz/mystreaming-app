import { generateUUID } from "@/infra/lib/uuid";
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { titlesToGenres } from "./titles-to-genres";
import { seasonsTable } from "./seasons";
import { titleImagesTable } from "./title-images";

export const titleTypeEnum = pgEnum("titleType", ["MOVIE", "TV_SHOW"]);

export const titleOriginEnum = pgEnum("titleOrigin", ["TMDB", "IMDB", "LOCAL"]);

export const titlesTable = pgTable("titles", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  externalIdentifier: varchar().unique(),

  tmdbId: integer(),
  imdbId: varchar(),

  name: varchar(),
  overview: varchar(),

  tagline: varchar(),

  releaseDate: timestamp(),
  originalLanguage: varchar(),

  popularity: doublePrecision().default(0),

  rating: doublePrecision(),
  ratingCount: integer(),

  bannerKey: varchar(),
  posterKey: varchar(),

  origin: titleOriginEnum().notNull(),
  type: titleTypeEnum().notNull(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const titlesRelations = relations(titlesTable, ({ many }) => ({
  titlesToGenres: many(titlesToGenres),
  seasons: many(seasonsTable),
  images: many(titleImagesTable),
}));

export type Title = typeof titlesTable.$inferSelect;
