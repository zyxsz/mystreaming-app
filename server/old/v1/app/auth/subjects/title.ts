import { z } from "zod";

export const titleSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Title"),
]);

export type TitleSubject = z.infer<typeof titleSubject>;
