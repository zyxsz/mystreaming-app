import { generateUUID } from "@/infra/lib/uuid";
import {
  doublePrecision,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const storageMetricTypeEnum = pgEnum("storageMetricType", [
  "EGRESS",
  "INGRESS",
  "DELETE",
  "STORE",
]);
export const storageMetricReferenceTypeEnum = pgEnum(
  "storageMetricReferenceType",
  ["UPLOAD", "ENCODE", "MEDIA_PLAYBACK"]
);

export const storageMetricsTable = pgTable("storageMetrics", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  authorId: uuid().references(() => usersTable.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),

  ipAddress: varchar(),
  location: varchar(),

  key: varchar(),
  bucket: varchar().notNull(),
  region: varchar(),

  reference: varchar().notNull(),
  referenceType: storageMetricReferenceTypeEnum().notNull(),

  bytes: doublePrecision().notNull(),
  type: storageMetricTypeEnum().notNull(),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
