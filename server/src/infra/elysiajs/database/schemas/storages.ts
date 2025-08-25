import { generateUUID } from "@/infra/lib/uuid";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { uploadsTable } from "./uploads";

export const storagesTable = pgTable("storages", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  accessKeyId: varchar().notNull(),
  secretAccessKey: varchar().notNull(),
  region: varchar().notNull(),
  bucket: varchar().notNull().unique(),
  endpoint: varchar(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const storagesRelations = relations(storagesTable, ({ many }) => ({}));
