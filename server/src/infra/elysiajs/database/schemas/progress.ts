import { generateUUID } from "@/infra/lib/uuid";
import {
  boolean,
  doublePrecision,
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";
import { titlesTable } from "./titles";
import { episodesTable } from "./episodes";

export const progressTable = pgTable("progress", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  userId: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  titleId: uuid()
    .notNull()
    .references(() => titlesTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  episodeId: uuid().references(() => episodesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  currentTime: doublePrecision().default(0.0),
  totalDuration: doublePrecision().default(0.0),
  percentage: doublePrecision().default(0.0),
  completed: boolean().default(false),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const progressRelations = relations(progressTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [progressTable.userId],
    references: [usersTable.id],
  }),
  title: one(titlesTable, {
    fields: [progressTable.titleId],
    references: [titlesTable.id],
  }),
  episode: one(episodesTable, {
    fields: [progressTable.episodeId],
    references: [episodesTable.id],
  }),
}));
