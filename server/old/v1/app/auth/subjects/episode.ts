import { z } from "zod";

export const episodeSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Episode"),
]);

export type EpisodeSubject = z.infer<typeof episodeSubject>;
