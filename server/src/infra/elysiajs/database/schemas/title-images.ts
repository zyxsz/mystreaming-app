import { generateUUID } from "@/infra/lib/uuid";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { titlesTable } from "./titles";
import { relations } from "drizzle-orm";

export const titleImageTypeEnum = pgEnum("titleImageType", [
  "BANNER",
  "POSTER",
  "LOGO",
  "OTHER",
  "THUMBNAIL",
]);

export const titleImagesTable = pgTable("titleImages", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  titleId: uuid().references(() => titlesTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  width: integer().notNull(),
  height: integer(),

  key: varchar().unique().notNull(),
  type: titleImageTypeEnum().notNull(),

  isProcessed: boolean().default(false),

  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const profilesRelations = relations(titleImagesTable, ({ one }) => ({
  title: one(titlesTable, {
    fields: [titleImagesTable.titleId],
    references: [titlesTable.id],
  }),
}));

export type TitleImage = typeof titleImagesTable.$inferSelect;
