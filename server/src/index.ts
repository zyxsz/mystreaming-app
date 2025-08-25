import { Elysia } from "elysia";
import { env } from "./config/env";
import { cors } from "@elysiajs/cors";
import { v1App } from "./infra/elysiajs/http";
import { hijack, instance } from "elysia-lambda";

const app = new Elysia()
  .use(cors())
  .use(v1App)
  .listen(env.PORT || 3333);

if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.use(hijack() as unknown as any);
}

console.log(
  `🦊 Elysia is running in ${env.NODE_ENV} mode at ${app.server?.hostname}:${app.server?.port}`
);

export default {
  js: process.env.AWS_LAMBDA_FUNCTION_NAME
    ? // @ts-ignore
      instance().innerHandle || instance().fetch
    : undefined,
};
