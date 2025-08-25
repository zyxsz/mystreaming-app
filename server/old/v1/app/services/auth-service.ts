import {
  generatePasswordHash,
  signToken,
  verifyPasswordHash,
  verifyToken,
} from "@/infra/v1/app/auth";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import { database } from "@/infra/database";
import { usersTable } from "@/infra/database/schemas/users";
import { eq, or, sql } from "drizzle-orm";
import { BadRequestError } from "../../../../app/errors/bad-request";
import { NotFoundError } from "../../../../app/errors/not-found";
import { addDays } from "date-fns";
import { InternalServerError } from "../../../../app/errors/internal-server";

export abstract class AuthService {
  static async validate(token: string) {
    const payload = await verifyToken(token);

    if (!payload) throw new UnauthorizedError("Invalid authorization token");

    const user = await database
      .select({
        id: usersTable.id,
        email: usersTable.email,
        username: usersTable.username,
        role: usersTable.role,
        updatedAt: usersTable.updatedAt,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.id))
      .limit(1)
      .then((result) => result[0] || null);

    if (!user) throw new UnauthorizedError("Invalid user");

    return user;
  }

  static async login(data: {
    email?: string;
    username?: string;
    password: string;
  }) {
    if (!data.email && !data.username)
      throw new BadRequestError("Email or username need to be provided");

    const user = await database
      .select()
      .from(usersTable)
      .where(
        or(
          data.email
            ? eq(sql`lower(${usersTable.email})`, data.email.toLowerCase())
            : undefined,
          data.username
            ? eq(
                sql`lower(${usersTable.username})`,
                data.username.toLowerCase()
              )
            : undefined
        )
      )
      .then((result) => result[0] || null);

    if (!user) throw new NotFoundError("User not found");
    if (!user.password) throw new BadRequestError("Invalid password (x.1)");

    if (!(await verifyPasswordHash(data.password, user.password)))
      throw new BadRequestError("Invalid password");

    const expiresAt = addDays(new Date(), 7);
    const token = await signToken(
      { id: user.id, exp: expiresAt.getTime() },
      expiresAt.getTime()
    );

    return {
      token,
      expiresAt,
    };
  }

  static async register(data: {
    username: string;
    email: string;
    password: string;
  }) {
    const userAlreadyExists = await database
      .select()
      .from(usersTable)
      .where(
        or(
          eq(sql`lower(${usersTable.email})`, data.email.toLowerCase()),
          eq(sql`lower(${usersTable.username})`, data.username.toLowerCase())
        )
      )
      .then((result) => result[0] || null);

    if (userAlreadyExists) throw new BadRequestError("User already exists");

    const passwordHash = await generatePasswordHash(data.password);

    const user = await database
      .insert(usersTable)
      .values({
        email: data.email.toLowerCase(),
        username: data.username,
        password: passwordHash,
        role: "USER",
      })
      .returning({ id: usersTable.id })
      .then((result) => result[0] || null);

    if (!user) throw new InternalServerError("Error while creating a new user");

    const expiresAt = addDays(new Date(), 7);
    const token = await signToken(
      { id: user.id, exp: expiresAt.getTime() },
      expiresAt.getTime()
    );

    return {
      token,
      expiresAt,
    };
  }
}
