import { z } from "zod";

const CloudflareAccountSchema = z.object({
  id: z.string(),
  name: z.string()
});

const D1DatabaseSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    uuid: z.string().optional()
  })
  .refine(({ id, uuid }) => id !== undefined || uuid !== undefined, {
    message: "A D1 database requires an id or uuid."
  })
  .transform(({ id, name, uuid }) => {
    return { id: uuid ?? id!, name };
  });

const WranglerIdentitySchema = z
  .object({
    accounts: z.array(CloudflareAccountSchema).min(1),
    email: z.string().optional(),
    loggedIn: z.literal(true)
  })
  .transform(({ accounts, email }) => {
    return {
      accounts,
      ...(email === undefined ? {} : { email })
    };
  });

const D1DatabaseListSchema = z.array(D1DatabaseSchema);

export type CloudflareAccount = z.infer<typeof CloudflareAccountSchema>;
export type D1Database = z.infer<typeof D1DatabaseSchema>;
export type WranglerIdentity = z.infer<typeof WranglerIdentitySchema>;

export function parseD1DatabaseList(output: string): D1Database[] {
  const result = D1DatabaseListSchema.safeParse(JSON.parse(output));
  if (!result.success) {
    throw new Error("Wrangler returned an invalid D1 database list.");
  }
  return result.data;
}

export function parseWranglerIdentity(output: string): WranglerIdentity {
  const result = WranglerIdentitySchema.safeParse(JSON.parse(output));
  if (!result.success) {
    if (result.error.issues.some((issue) => issue.path[0] === "loggedIn")) {
      throw new Error("Wrangler is not authenticated with a Cloudflare account.");
    }
    throw new Error("The Wrangler login has no available Cloudflare accounts.");
  }
  return result.data;
}
