import { UnauthorizedError } from "@/app/errors/unauthorized";
import { AuthUseCase } from "@/app/use-cases/auth/auth.use-case";
import { database } from "@/infra/elysiajs/database";
import { DrizzleUsersRepository } from "@/infra/elysiajs/database/repositories/drizzle.users.repository";
import { BCryptService } from "@/infra/elysiajs/services/bcrypt.service";
import { JWTService } from "@/infra/elysiajs/services/jwt.service";
import Elysia, { t } from "elysia";
import { UsersPresenter } from "../presenters/users.presenter";

const jwtService = new JWTService();
const bcryptService = new BCryptService();

const usersRepository = new DrizzleUsersRepository(database);
const authUseCase = new AuthUseCase(usersRepository, jwtService, bcryptService);

export const AuthEndpoints = new Elysia({
  prefix: "/auth",
})
  .get("/validate", async ({ headers }) => {
    const authorizationHeader =
      headers["Authorization"] || headers["authorization"];

    if (!authorizationHeader)
      throw new UnauthorizedError("Invalid authorization header");

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer")
      throw new UnauthorizedError("Invalid authorization type");

    const user = await authUseCase.validate(token);

    return UsersPresenter.toHttp(user);
  })
  .post(
    "/login",
    async ({ body }) => {
      const result = await authUseCase.login(body);

      return result;
    },
    {
      query: t.Object({}),
      body: t.Object(
        {
          email: t.String({
            format: "email",
            examples: "example@mystreaming.com",
          }),
          // username: t.Optional(
          //   t.String({
          //     minLength: 4,
          //     maxLength: 32,
          //     examples: "Example",
          //   })
          // ),
          password: t.String({
            minLength: 5,
            maxLength: 64,
            examples: "********",
          }),
        },
        { title: "Login user", description: "Login user object" }
      ),
    }
  )
  .post(
    "/register",
    async ({ body }) => {
      // const result = await AuthService.register(body);
      // return result;
    },
    {
      body: t.Object(
        {
          email: t.String({
            format: "email",
            examples: "example@mystreaming.com",
          }),
          username: t.String({
            minLength: 4,
            maxLength: 32,
            examples: "Example",
          }),
          password: t.String({
            minLength: 5,
            maxLength: 64,
            examples: "********",
          }),
        },
        { title: "Register user", description: "Register user object" }
      ),
    }
  );
