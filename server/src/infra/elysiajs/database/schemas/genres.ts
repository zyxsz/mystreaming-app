import { relations } from "drizzle-orm";
import { integer, numeric, pgTable, varchar } from "drizzle-orm/pg-core";
import { titlesToGenres } from "./titles-to-genres";

export const genresTable = pgTable("genres", {
  id: varchar().unique().primaryKey().notNull(),
  externalId: integer().notNull(),

  name: varchar(),
  defaultLanguage: varchar(),
});

export const genresRelations = relations(genresTable, ({ many }) => ({
  titlesToGenres: many(titlesToGenres),
}));
