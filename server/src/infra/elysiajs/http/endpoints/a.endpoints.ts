import Elysia, { t } from "elysia";

export const endpoints = new Elysia({
  prefix: "/blablabla",
  aot: false,
}).get("/:ccc", ({ params: { ccc } }) => `ID: ${ccc}`, {
  params: t.Object({
    ccc: t.String({ minLength: 2 }),
  }),
});
