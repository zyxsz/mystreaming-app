import { z } from "zod";

export const transcoderSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Transcoder"),
]);

export type TranscoderSubject = z.infer<typeof transcoderSubject>;
