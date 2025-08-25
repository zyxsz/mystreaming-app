import { generateUUID } from "@/infra/lib/uuid";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const transcodersTable = pgTable("transcoders", {
  id: uuid()
    .primaryKey()
    .unique()
    .$default(() => generateUUID()),

  accessKeyId: varchar().notNull(),
  secretAccessKey: varchar().notNull(),
  region: varchar().notNull(),
  endpoint: varchar(),

  jobDefinition: varchar().notNull(),
  jobQueue: varchar().notNull(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
