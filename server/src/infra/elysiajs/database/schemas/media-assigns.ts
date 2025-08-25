import { generateUUID } from "@/infra/lib/uuid";
import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { mediasTable } from "./medias";
import { titlesTable } from "./titles";
import { usersTable } from "./users";
import { episodesTable } from "./episodes";
import { relations } from "drizzle-orm";

export const mediaAssignsTable = pgTable(
  "mediaAssigns",
  {
    id: uuid()
      .primaryKey()
      .unique()
      .$default(() => generateUUID()),

    titleId: uuid()
      .notNull()
      .references(() => titlesTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    mediaId: uuid()
      .notNull()
      .references(() => mediasTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    episodeId: uuid().references(() => episodesTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    assignedBy: uuid().references(() => usersTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    assignedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  }
  // (t) => [primaryKey({ columns: [t.titleId, t.mediaId] })]
);

export const mediaAssignsRelations = relations(
  mediaAssignsTable,
  ({ one }) => ({
    title: one(titlesTable, {
      fields: [mediaAssignsTable.titleId],
      references: [titlesTable.id],
    }),
    media: one(mediasTable, {
      fields: [mediaAssignsTable.mediaId],
      references: [mediasTable.id],
    }),
    assignedBy: one(usersTable, {
      fields: [mediaAssignsTable.assignedBy],
      references: [usersTable.id],
    }),
    episodeId: one(episodesTable, {
      fields: [mediaAssignsTable.episodeId],
      references: [episodesTable.id],
    }),
  })
);
