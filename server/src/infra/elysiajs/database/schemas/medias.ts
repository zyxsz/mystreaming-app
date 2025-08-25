import { generateUUID } from "@/infra/lib/uuid";
import {
  doublePrecision,
  json,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { uploadsTable } from "./uploads";
import { relations } from "drizzle-orm";
import { encodesTable } from "./encodes";

export const mediaStatus = pgEnum("mediaStatus", [
  "CREATED",
  "WAITING_ENCODE",
  "AVAILABLE",
  "DELETED",
]);

export const mediasTable = pgTable("medias", {
  id: uuid()
    .primaryKey()
    .unique()
    .$default(() => generateUUID()),

  encodeId: uuid().references(() => encodesTable.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),

  name: varchar(),
  status: mediaStatus().default("CREATED"),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const mediasRelations = relations(mediasTable, ({ one }) => ({
  encode: one(encodesTable, {
    fields: [mediasTable.encodeId],
    references: [encodesTable.id],
  }),
}));
