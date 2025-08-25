import { database } from "@/infra/database";
import { usersTable } from "@/infra/database/schemas/users";
import { eq, or, sql } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { BadRequestError } from "../../../../app/errors/bad-request";
import {
  generatePasswordHash,
  signToken,
  verifyPasswordHash,
  verifyToken,
} from "@/infra/v1/app/auth";
import jwt from "@elysiajs/jwt";
import { env } from "@/config/env";
import { UnauthorizedError } from "../../../../app/errors/unauthorized";
import { AuthService } from "@/infra/v1/app/services/auth-service";

export const authRoutes = new Elysia({
  prefix: "/auth",
  // detail: {
  //   tags: ["Auth"],
  //   security: [
  //     {
  //       bearerAuth: [],
  //     },
  //   ],
  // },
})
  .get(
    "/validate",
    async ({ headers }) => {
      const authorizationHeader =
        headers["Authorization"] || headers["authorization"];

      if (!authorizationHeader)
        throw new UnauthorizedError("Invalid authorization header");

      const [type, token] = authorizationHeader.split(" ");

      if (type !== "Bearer")
        throw new UnauthorizedError("Invalid authorization type");

      const user = await AuthService.validate(token);

      return user;
    },
    {
      detail: {
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                examples: {
                  "Authenticated user": {
                    value: {
                      id: "1",
                      email: "example@me.com",
                      username: "example",
                      role: "USER",
                      updatedAt: "2025-05-18T18:22:34.879Z",
                      createdAt: "2025-05-18T18:22:34.879Z",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                examples: {
                  Unauthorized: {
                    value: {
                      message: "Unauthorized",
                      status: 401,
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .post(
    "/login",
    async ({ body }) => {
      const result = await AuthService.login(body);

      return result;
    },
    {
      body: t.Object(
        {
          email: t.Optional(
            t.String({
              format: "email",
              examples: "example@mystreaming.com",
            })
          ),
          username: t.Optional(
            t.String({
              minLength: 4,
              maxLength: 32,
              examples: "Example",
            })
          ),
          password: t.String({
            minLength: 5,
            maxLength: 64,
            examples: "********",
          }),
        },
        { title: "Login user", description: "Login user object" }
      ),
      response: t.Object({
        token: t.String(),
        expiresAt: t.Date(),
      }),
      detail: {
        security: [],
        description: "Used to login into a valid account",
        responses: {
          404: {
            description: "User not found",
            content: {
              "application/json": {
                examples: {
                  "User not found": {
                    value: {
                      message: "User not found",
                      status: 404,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "User not found",
            content: {
              "application/json": {
                examples: {
                  "Email or username need to be provided": {
                    value: {
                      message: "Email or username need to be provided",
                      status: 400,
                    },
                  },
                  "Invalid password (x.1)": {
                    value: {
                      message: "User doesnt have a password",
                      status: 400,
                    },
                  },
                  "Invalid password": {
                    value: {
                      message: "Invalid password",
                      status: 400,
                    },
                  },
                },
              },
            },
          },
          200: {
            description: "User authenticated",
            content: {
              "application/json": {
                examples: {
                  Success: {
                    description: "dasda",
                    value: {
                      token:
                        "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAxOTZlNGEyLTI5N2UtNzFmMC04NTg4LTZjZmIyYTk0ZmJhMiIsImV4cCI6MTc0ODIwMDI5MTg1MiwiaWF0IjoxNzQ3NTk1NDkxfQ...",
                      expiresAt: "2025-05-25T19:11:31.852Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .post(
    "/register",
    async ({ body }) => {
      const result = await AuthService.register(body);

      return result;
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
      detail: {
        security: [],
        description: "Used to register a new account",
        responses: {
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                examples: {
                  "Error while creating a new user": {
                    value: {
                      message: "Error while creating a new user",
                      status: 500,
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "User not found",
            content: {
              "application/json": {
                examples: {
                  "User already exists": {
                    value: {
                      message: "User already exists",
                      status: 400,
                    },
                  },
                },
              },
            },
          },
          200: {
            description: "User created",
            content: {
              "application/json": {
                examples: {
                  Success: {
                    value: {
                      token:
                        "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjAxOTZlNGEyLTI5N2UtNzFmMC04NTg4LTZjZmIyYTk0ZmJhMiIsImV4cCI6MTc0ODIwMDI5MTg1MiwiaWF0IjoxNzQ3NTk1NDkxfQ...",
                      expiresAt: "2025-05-25T19:11:31.852Z",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  );
