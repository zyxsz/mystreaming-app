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
import { episodesTable } from "./episodes";

export const seasonOriginEnum = pgEnum("seasonOrigin", [
  "TMDB",
  "IMDB",
  "LOCAL",
]);

export const seasonsTable = pgTable("seasons", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  titleId: uuid().references(() => titlesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  tmdbId: integer().unique(),
  number: integer(),

  name: varchar(),
  overview: varchar(),

  posterKey: varchar(),
  airDate: timestamp(),

  rating: doublePrecision(),
  origin: seasonOriginEnum(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const seasonsRelations = relations(seasonsTable, ({ one, many }) => ({
  title: one(titlesTable, {
    fields: [seasonsTable.titleId],
    references: [titlesTable.id],
  }),
  episodes: many(episodesTable),
}));

export type Season = typeof seasonsTable.$inferSelect;
