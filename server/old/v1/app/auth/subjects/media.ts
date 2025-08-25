import { z } from "zod";

export const mediaSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Media"),
]);

export type MediaSubject = z.infer<typeof mediaSubject>;
