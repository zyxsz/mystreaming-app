import { generateUUID } from "@/infra/lib/uuid";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";

export const friendshipsTable = pgTable("friendships", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  user1Id: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  user2Id: uuid()
    .notNull()
    .references(() => usersTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const friendshipsRelations = relations(friendshipsTable, ({ one }) => ({
  user1: one(usersTable, {
    fields: [friendshipsTable.user1Id],
    references: [usersTable.id],
    relationName: "userTable",
  }),
  user2: one(usersTable, {
    fields: [friendshipsTable.user2Id],
    references: [usersTable.id],
    relationName: "userTable",
  }),
}));
