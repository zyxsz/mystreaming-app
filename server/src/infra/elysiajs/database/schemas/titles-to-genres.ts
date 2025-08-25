import { pgTable, primaryKey, uuid, varchar } from "drizzle-orm/pg-core";
import { titlesTable } from "./titles";
import { genresTable } from "./genres";
import { relations } from "drizzle-orm";

export const titlesToGenres = pgTable(
  "titlesToGenres",
  {
    titleId: uuid()
      .notNull()
      .references(() => titlesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    genreId: varchar()
      .notNull()
      .references(() => genresTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => [primaryKey({ columns: [t.titleId, t.genreId] })]
);

export const titlesToGenresRelations = relations(titlesToGenres, ({ one }) => ({
  title: one(titlesTable, {
    fields: [titlesToGenres.titleId],
    references: [titlesTable.id],
  }),
  genre: one(genresTable, {
    fields: [titlesToGenres.genreId],
    references: [genresTable.id],
  }),
}));
