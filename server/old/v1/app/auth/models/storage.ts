import { z } from "zod";

export const storageSchema = z.object({
  __typename: z.literal("Storage").default("Storage"),
  id: z.string(),
});

export type Storage = z.infer<typeof storageSchema>;
