import { generateUUID } from "@/infra/lib/uuid";
import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { storagesTable } from "./storages";
import { relations } from "drizzle-orm";

export const uploadStatus = pgEnum("uploadStatus", [
  "CREATED",
  "UPLOADING",
  "COMPLETED",
]);

export const uploadsTable = pgTable("uploads", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  multipartUploadId: varchar().notNull(),

  key: varchar().unique().notNull(),
  originalName: varchar().notNull(),

  size: doublePrecision().notNull(),
  type: varchar().notNull(),

  status: uploadStatus().default("CREATED").notNull(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const uploadsRelations = relations(uploadsTable, ({ one }) => ({}));
