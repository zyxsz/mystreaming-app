import Elysia, { type Context } from "elysia";
import { UnauthorizedError } from "@/app/errors/unauthorized";
import { JWTService } from "../../services/jwt.service";
import { BCryptService } from "../../services/bcrypt.service";
import { DrizzleUsersRepository } from "../../database/repositories/drizzle.users.repository";
import { database } from "../../database";
import { AuthUseCase } from "@/app/use-cases/auth/auth.use-case";

const jwtService = new JWTService();
const bcryptService = new BCryptService();

const usersRepository = new DrizzleUsersRepository(database);
const authUseCase = new AuthUseCase(usersRepository, jwtService, bcryptService);

export const authMiddlewareHandle = async ({ headers }: Context) => {
  const authorizationHeader =
    headers["Authorization"] || headers["authorization"];

  if (!authorizationHeader)
    throw new UnauthorizedError("Invalid authorization header");

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer")
    throw new UnauthorizedError("Invalid authorization type");

  const user = await authUseCase.validate(token);

  return { user };
};

export const authMiddleware = new Elysia().derive(
  { as: "scoped" },
  authMiddlewareHandle
);
