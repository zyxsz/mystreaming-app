import { generateUUID } from "@/infra/lib/uuid";
import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { profilesTable } from "./profiles";
import { friendshipRequestsTable } from "./friendship-requests";
import { friendshipsTable } from "./friendships";

export const roleEnum = pgEnum("role", ["ADMIN", "MANAGER", "MEMBER", "USER"]);

export const usersTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => generateUUID()),

  username: varchar({ length: 32 }).unique().notNull(),

  email: varchar({ length: 254 }).unique().notNull(),
  password: varchar(),

  role: roleEnum().notNull(),

  isEmailVerified: boolean().default(false),
  isFromExternalProvider: boolean().default(false),

  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  profile: one(profilesTable),
  friendshipRequests: many(friendshipRequestsTable),
  friendships: many(friendshipsTable),
}));

export type User = typeof usersTable.$inferSelect;
