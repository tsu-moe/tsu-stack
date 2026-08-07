import { z } from "zod";

import { normalizeProjectName, normalizeScope } from "./naming";
import { SETUP_MODES, VARIANT_NAMES } from "./types";

export const projectInputSchema = z
  .object({
    displayName: z.string().trim().min(1),
    dryRun: z.boolean(),
    git: z.boolean(),
    install: z.boolean(),
    projectDirectory: z.string().trim().min(1),
    projectName: z.string().transform(normalizeProjectName),
    ref: z.string().trim().min(1).optional(),
    scope: z.string().transform(normalizeScope),
    setup: z.enum(SETUP_MODES),
    variant: z.enum(VARIANT_NAMES)
  })
  .superRefine((input, context) => {
    if (input.setup !== "none" && !input.install) {
      context.addIssue({
        code: "custom",
        message: "Guided setup requires dependency installation.",
        path: ["setup"]
      });
    }
    if (input.setup === "cloudflare" && input.variant !== "cloudflare-d1") {
      context.addIssue({
        code: "custom",
        message: "Cloudflare provisioning is only available for the cloudflare-d1 variant.",
        path: ["setup"]
      });
    }
  });
