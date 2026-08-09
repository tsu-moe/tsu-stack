import { z } from "zod";

export const PackageJsonSchema = z
  .object({
    name: z.string().optional(),
    scripts: z.record(z.string(), z.string()).optional()
  })
  .catchall(z.json());
