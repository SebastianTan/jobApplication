import { z } from "zod";

export const jobDescriptionBodySchema = z.object({
  content: z
    .string()
    .max(512 * 1024, "Job description is too large (max 512KB)"),
});
