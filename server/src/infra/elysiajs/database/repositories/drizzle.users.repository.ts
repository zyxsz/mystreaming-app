import type { User } from "@/app/entities/user.entity";
import type { UsersRepository } from "@/app/repositories/users.repository";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";
import { usersTable } from "../schemas/users";
import { eq, sql } from "drizzle-orm";
import { DrizzleUsersMapper } from "./mappers/drizzle.users.mapper";

export class DrizzleUsersRepository implements UsersRepository {
  constructor(private database: NeonDatabase) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.database
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!user) return null;

    return DrizzleUsersMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.database
      .select()
      .from(usersTable)
      .where(eq(sql`lower(${usersTable.email})`, email.toLowerCase()))
      .limit(1)
      .then((r) => r[0]);

    if (!user) return null;

    return DrizzleUsersMapper.toDomain(user);
  }
}
