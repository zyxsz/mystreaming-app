import {
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { relations } from "drizzle-orm";
import { generateUUID } from "@/infra/lib/uuid";

export const friendshipRequestStatus = pgEnum("friendshipRequestStatus", [
  "PENDING",
  "ACCEPTED",
  "DENIED",
]);

export const friendshipRequestsTable = pgTable(
  "friendshipRequests",
  {
    id: uuid()
      .primaryKey()
      .$default(() => generateUUID()),

    from: uuid()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    to: uuid()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    status: friendshipRequestStatus(),

    acceptedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  }
  // (t) => [primaryKey({ columns: [t.from, t.to] })]
);

export const friendshipRequestsRelations = relations(
  friendshipRequestsTable,
  ({ one }) => ({
    from: one(usersTable, {
      fields: [friendshipRequestsTable.from],
      references: [usersTable.id],
    }),
    to: one(usersTable, {
      fields: [friendshipRequestsTable.to],
      references: [usersTable.id],
    }),
  })
);
