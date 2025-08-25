import { drizzle } from "drizzle-orm/neon-serverless";
import postgres from "postgres";
import { Pool } from "@neondatabase/serverless";
import { seed } from "drizzle-seed";
import { usersTable } from "./schemas/users";
import { env } from "@/config/env";

// const queryClient = postgres(env.DATABASE_URL);

// const queryClient = neon(env.DATABASE_URL);

const pool = new Pool({ connectionString: env.DATABASE_URL });

export const database = drizzle({
  client: pool,
  casing: "camelCase",
  logger: true,
});

export type Database = typeof database;

async function main() {
  await seed(database, { users: usersTable }).refine((f) => ({
    users: {
      columns: {
        username: f.firstName(),
        email: f.email(),
      },
      count: 20,
    },
  }));
}

// main();
//ad
