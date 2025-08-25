import { generateUUID } from "@/infra/lib/uuid";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const profilesTable = pgTable("profiles", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  userId: uuid("userId")
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),

  avatar: varchar(),
  banner: varchar(),

  nickname: varchar({ length: 128 }),
  tagline: varchar({ length: 64 }),

  bio: varchar(),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const profilesRelations = relations(profilesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [profilesTable.userId],
    references: [usersTable.id],
    relationName: "userTable",
  }),
}));

export type Profile = typeof profilesTable.$inferSelect;
