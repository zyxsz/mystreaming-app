import { z } from "zod";

export const uploadSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Upload"),
]);

export type UploadSubject = z.infer<typeof uploadSubject>;
