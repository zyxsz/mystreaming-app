import { z } from "zod";

export const progressSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
    z.literal("save"),
  ]),
  z.literal("Progress"),
]);

export type ProgressSubject = z.infer<typeof progressSubject>;
