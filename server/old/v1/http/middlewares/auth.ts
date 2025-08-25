import Elysia, { type Context } from "elysia";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import jwt from "@elysiajs/jwt";
import { verifyToken } from "@/infra/v1/app/auth";
import { database } from "@/infra/database";
import { usersTable } from "@/infra/database/schemas/users";
import { eq } from "drizzle-orm";
import { AuthService } from "@/infra/v1/app/services/auth-service";

export const authMiddlewareHandle = async ({ headers }: Context) => {
  const authorizationHeader =
    headers["Authorization"] || headers["authorization"];

  if (!authorizationHeader)
    throw new UnauthorizedError("Invalid authorization header");

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer")
    throw new UnauthorizedError("Invalid authorization type");

  const user = await AuthService.validate(token);

  return { user };
};

export const authMiddleware = new Elysia().derive(
  { as: "scoped" },
  authMiddlewareHandle
);
