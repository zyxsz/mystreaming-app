import { z } from "zod";

export const titleSchema = z.object({
  __typename: z.literal("Title").default("Title"),
  id: z.string(),
});

export type Title = z.infer<typeof titleSchema>;
