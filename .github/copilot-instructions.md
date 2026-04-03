# tsu!stack Project

An opinionated Vite+ monorepo. It uses `vp` (Vite+ CLI) to run scripts across packages, and `vpx` to run package binaries without installing them. You can run `vp run -w` to run a command in the workspace root `package.json` context.

## Tech Stack

| Package        | Role                                               |
| -------------- | -------------------------------------------------- |
| TanStack Start | Full-stack React framework (SSR/SPA/ISR) via Nitro |
| Hono           | Node.js API server (WinterCG-compliant)            |
| oRPC           | RPC layer + OpenAPI/Scalar docs                    |
| Drizzle ORM    | Type-safe ORM                                      |
| PostgreSQL     | Primary database                                   |
| Better Auth    | Self-hosted auth                                   |
| Paraglide.js   | Compiled i18n                                      |
| shadcn/ui      | Component library                                  |

## Monorepo Structure

```
apps/server   - Hono API server (port 5000, path /server)
apps/web      - TanStack Start web app (port 3000, path /web)
packages/api  - oRPC routers & client where all the API logic lives with OpenAPI metadata
packages/auth - Better Auth config
packages/db   - Drizzle schemas & migrations, run `vp run -w db:*` to manage the database
packages/env  - Shared env validation (.env lives here)
packages/i18n - Paraglide i18n + Vite plugin
packages/logger - Logtape isomorphic logger (client + server) with designated categories
packages/ui   - shadcn/ui components shared across all apps/*
tools/tsconfig - Shared TypeScript base config
```

## Key Commands

> All scripts are run via `vp run <script>` (not `vp <script>`), because the script names overlap with Vite+ built-ins.

| Command                  | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `vp run dev`             | Start all dev servers concurrently                       |
| `vp run fix`             | Format, lint, and type-check (auto-runs on `git commit`) |
| `vp run test`            | Run all tests                                            |
| `vp run build`           | Build all packages                                       |
| `vp run db:dev:start`    | Start local PostgreSQL (Docker)                          |
| `vp run db:dev:stop`     | Stop local PostgreSQL                                    |
| `vp run db:migrate`      | Run Drizzle migrations                                   |
| `vp run db:generate`     | Generate Drizzle migration files                         |
| `vp run db:studio`       | Open Drizzle Studio                                      |
| `vp run auth:secret`     | Generate a Better Auth secret                            |
| `vp run docker:up`       | Start full stack in Docker                               |
| `vp run docker:up:build` | Rebuild and start full stack in Docker                   |

> `vpx <pkg>` is shorthand for `vp dlx <pkg>` (run a package binary without installing it).

## Environment Variables

All environment variables live in `packages/env/.env` (copy from `packages/env/.env.example`).
