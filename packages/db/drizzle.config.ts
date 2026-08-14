import { type Config } from "drizzle-kit";

export default {
  breakpoints: true,
  introspect: {
    casing: "preserve"
  },
  dialect: "sqlite",
  out: "./migrations",
  schema: "./src/schema/index.ts",

  verbose: true
} satisfies Config;
