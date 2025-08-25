import { z } from "zod";

export const storageSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("get"),
    z.literal("update"),
    z.literal("delete"),
    z.literal("create"),
  ]),
  z.literal("Storage"),
]);

export type StorageSubject = z.infer<typeof storageSubject>;
