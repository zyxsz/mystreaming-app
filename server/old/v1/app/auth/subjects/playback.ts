import { z } from "zod";

export const playbackSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Playback"),
]);

export type PlaybackSubject = z.infer<typeof playbackSubject>;
