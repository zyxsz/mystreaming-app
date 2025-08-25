import {
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { mediasTable } from "./medias";
import { generateUUID } from "@/infra/lib/uuid";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

export const playbackStatus = pgEnum("playbackStatus", [
  "CREATED",
  "ALIVE",
  "INACTIVE",
  "EXPIRED",
  "FINISHED",
  "CLOSED",
]);

export const playbacksTable = pgTable(
  "playbacks",
  {
    id: uuid()
      .primaryKey()
      .unique()
      .$default(() => generateUUID()),

    userId: uuid().references(() => usersTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    mediaId: uuid().references(() => mediasTable.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    currentTime: doublePrecision().default(0),
    status: playbackStatus().default("CREATED"),

    lastKeepAliveAt: timestamp({ withTimezone: true }),
    expiresAt: timestamp({ withTimezone: true }),

    duration: integer().default(0),

    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("playback_status_idx").on(table.status)]
);

export const playbacksRelations = relations(playbacksTable, ({ one }) => ({
  media: one(mediasTable, {
    fields: [playbacksTable.mediaId],
    references: [mediasTable.id],
  }),
  user: one(usersTable, {
    fields: [playbacksTable.userId],
    references: [usersTable.id],
  }),
}));
