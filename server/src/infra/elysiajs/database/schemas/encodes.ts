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
import type {
  EncodeAudioQuality,
  EncodeEncryption,
  EncodeVideoQuality,
} from "@/app/entities/encode.entity";

export const encodeStatus = pgEnum("encodeStatus", [
  "IN_QUEUE",
  "PROCESSING",
  "COMPLETED",
]);

export const encodesTable = pgTable("encodes", {
  id: uuid()
    .primaryKey()
    .unique()
    .$default(() => generateUUID()),

  inputId: uuid().references(() => uploadsTable.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),

  // Encode props
  size: doublePrecision(),

  videoQualities: json().$type<EncodeVideoQuality[]>().default([]),
  audioQualities: json().$type<EncodeAudioQuality[]>().default([]),

  // Progress and status
  progress: doublePrecision().default(0.0),
  status: encodeStatus().default("IN_QUEUE"),

  // Job data
  costInCents: doublePrecision(),
  startedAt: timestamp({ withTimezone: true }),
  endedAt: timestamp({ withTimezone: true }),

  // Media props
  key: varchar(),

  manifestKey: varchar(),
  thumbnailKey: varchar(),
  previewsKey: varchar(),

  duration: doublePrecision(),
  encryptions: json().$type<EncodeEncryption[]>().default([]),

  // Date control
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const encodesRelations = relations(encodesTable, ({ one }) => ({
  upload: one(uploadsTable, {
    fields: [encodesTable.inputId],
    references: [uploadsTable.id],
  }),
}));
