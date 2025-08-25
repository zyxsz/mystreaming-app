import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { titlesTable } from "./titles";
import { generateUUID } from "@/infra/lib/uuid";
import { relations } from "drizzle-orm";
import { seasonsTable } from "./seasons";

export const episodesOriginEnum = pgEnum("episodesOrigin", [
  "TMDB",
  "IMDB",
  "LOCAL",
]);

export const episodesTable = pgTable("episodes", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  seasonId: uuid().references(() => seasonsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  tmdbId: integer().unique(),
  imdbId: varchar().unique(),

  number: integer(),

  name: varchar(),
  overview: varchar(),

  bannerKey: varchar(),
  rating: doublePrecision(),

  airDate: timestamp(),
  origin: episodesOriginEnum(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const episodesRelations = relations(episodesTable, ({ one }) => ({
  season: one(seasonsTable, {
    fields: [episodesTable.seasonId],
    references: [seasonsTable.id],
  }),
}));

export type Episode = typeof episodesTable.$inferSelect;
