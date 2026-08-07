import { type Config } from "drizzle-kit";

export default {
  breakpoints: true,
  introspect: {
    casing: "preserve"
  },
  dialect: "sqlite",
  out: "./migrations",
  schema: "./src/schema/index.ts",

  strict: true,
  verbose: true
} satisfies Config;
