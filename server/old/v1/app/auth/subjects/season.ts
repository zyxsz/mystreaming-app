import { z } from "zod";

export const seasonSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Season"),
]);

export type SeasonSubject = z.infer<typeof seasonSubject>;
