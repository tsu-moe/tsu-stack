<h1 align="center">
    <img width="120" height="120" src="https://github.com/tsu-moe/tsu-stack/blob/main/apps/web/public/logo192.png?raw=true" alt="tsu!stack Logo"><br>
    <a href="https://tsu-stack.tsu.moe/">tsu!stack</a>
</h1>

<p align="center">
   <img src="https://img.shields.io/badge/NodeJS-26.8.2-green" alt="NodeJS version badge">
   <img src="https://img.shields.io/github/license/tsu-moe/tsu-stack" alt="License badge">
   <img src="https://img.shields.io/github/last-commit/tsu-moe/tsu-stack" alt="Last commit badge">
   <img src="https://img.shields.io/github/stars/tsu-moe/tsu-stack?style=flat" alt="GitHub stars badge">
   <img src="https://img.shields.io/github/forks/tsu-moe/tsu-stack?style=flat" alt="GitHub forks badge">
   <img src="https://img.shields.io/github/issues/tsu-moe/tsu-stack" alt="GitHub issues badge">
   <img src="https://img.shields.io/github/issues-pr/tsu-moe/tsu-stack" alt="GitHub pull requests badge">
   <img src="https://komarev.com/ghpvc/?username=tsu-moe-tsu-stack&label=views&color=blue&style=flat" alt="Repo views badge">
</p>

<p align="center">
  Vite Plus (Vite+) TanStack Start monorepo with shadcn/ui, Paraglide.js (i18n), Hono, oRPC, drizzle-orm, better-auth, Feature-Sliced Design (FSD), and more. 🐋 Dockerized and opinionated. Compatible with the ⛅ Cloudflare Workers workerd runtime with a few tweaks.
</p>

<p align="center">
  <img src="https://github.com/tsu-moe/tsu-stack/blob/main/apps/web/public/og/index.png?raw=true" alt="tsu!stack Screenshot" width="800" height="420">
</p>

<p align="center">
  <strong>✨ Live Demo Deployments ✨</strong><br />
  <a href="http://tsu-stack.tsu.moe" target="_blank">Dockerfile (Coolify)</a><br>
  <a href="http://tsu-stack-coolify.tsu.moe" target="_blank">Docker Compose (Coolify)</a><br>
  <a href="http://tsu-stack-merged.tsu.moe" target="_blank">Merged Web + Server with Dockerfile (Coolify)</a> | <a href="https://github.com/tsu-moe/tsu-stack/tree/variant/merged" target="_blank">see branch</a><br>
  <a href="https://tsu-stack.tsu-moe.workers.dev" target="_blank">Merged Web + Server (Cloudflare Workers)</a> | <a href="https://github.com/tsu-moe/tsu-stack/tree/variant/merged-cloudflare" target="_blank">see branch</a>
</p>

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Keeping Template Changes](#keeping-template-changes)
  - [Running PostgreSQL Variants with Docker Locally](#running-postgresql-variants-with-docker-locally)
  - [Database Migrations](#database-migrations)
- [Tech Stack](#tech-stack)
- [Deployment](#deployment)
  - [Coolify](#coolify)
  - [Cloudflare Workers](#cloudflare-workers)
  - [Dokploy](#dokploy)
  - [Deploying to Other Platforms](#deploying-to-other-platforms)
- [Environment Variables](#environment-variables)
- [Merged Application Architecture](#merged-application-architecture)
  - [Resource Usage](#resource-usage)
- [Issue Watchlist](#issue-watchlist)
  - [Pitfalls](#pitfalls)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Getting Started

### Prerequisites

- **Node.js** ≥ 26
  - install via [Node.js official website](https://nodejs.org/) or [nvm](https://github.com/nvm-sh/nvm)
- **Vite Plus (vp)**
  - install via `curl -fsSL https://vite.plus | bash` (macOS/Linux) or `irm https://vite.plus/ps1 | iex` (Windows)
- **pnpm** ≥ 12
  - install via `vp install -g pnpm`
- **Docker**
  - install it via their [official website](https://www.docker.com/)

### Setup

Use the dedicated [CLI Tool](https://github.com/tsu-moe/tsu-stack/tree/main/tools/create-tsu-stack) and answer the setup wizard questions:

```bash
npm create tsu-stack@next my-app
cd my-app
vp run dev
```

### Keeping Template Changes

Projects created from this template include the `sync-template` agent skill. Ask your coding agent to use `$sync-template` when you want to compare or integrate updates from the matching tsu-stack branch. The generated `.tsu-stack.jsonc` file records the exact source commit used at creation time.

### Running PostgreSQL Variants with Docker Locally

As an alternative to `vp run dev`, you can run the full stack inside Docker using the local compose file:

```bash
cp .env.docker.example .env.docker # And set environment variables as needed
vp run docker:up
vp run docker:up:build # OR: force a rebuild when you make changes to the code
```

### Database Migrations

```bash
# for PostgreSQL-based variants
vp run db:migrate        # uses the database specified in packages/db/drizzle.config.ts

# for Cloudflare-based variants
vp run db:migrate:local  # for the local miniflare D1 database
vp run db:migrate:remote # for the remote/prod D1 database
```

## Tech Stack

Here is a non-exhaustive list of the main technologies used in this project, along with their purposes and possible alternatives they replace:

| Technology                                        | Purpose                                                                                                                                                                       | Replaces/Similar Alternatives                                                      |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [**pnpm**](https://pnpm.io/)                      | Fast, disk-efficient package manager for Node.js with package catalogs for monorepo dependecy deduplication.                                                                  | npm, yarn                                                                          |
| [**Vite Plus (Vite+)**](https://viteplus.dev/)    | Unified toolchain for development, testing, and building the monorepo.                                                                                                        | Turborepo, Nx, Vitest, Prettier, ESLint, husky, lint-staged, lefthook, tsdown, tsc |
| [**TanStack Start**](https://tanstack.com/router) | Modern full-stack React framework with support for SPA, SSR, ISR, and integrated with TanStack Query. It uses Vite's Nitro adapter for cross-platform deployment portability. | Next.js, Remix, React Router                                                       |
| [**Paraglide.js**](https://paraglide.dev/)        | Compiled internationalization (i18n) library for managing translations.                                                                                                       | i18next, next-intl                                                                 |
| [**Hono**](https://hono.dev/)                     | Lightweight web server framework built on web standards and is WinterCG-compliant for cross-platform portability.                                                             | Express.js, Fastify, Elysia.js                                                     |
| [**oRPC**](https://orpc.dev/)                     | RPC framework to define API routes and generate OpenAPI specs and documentation with [Scalar](https://scalar.com/).                                                           | tRPC                                                                               |
| [**Drizzle ORM**](https://orm.drizzle.team/)      | Type-safe and lightweight ORM for database interactions.                                                                                                                      | Prisma, TypeORM                                                                    |
| [**PostgreSQL**](https://www.postgresql.org/)     | Stable open-source relational database.                                                                                                                                       | MySQL, MariaDB                                                                     |
| [**Better Auth**](https://better-auth.com/)       | Self-hosted authentication framework with support for all major OAuth providers.                                                                                              | Auth.js                                                                            |
| [**Docker**](https://www.docker.com/)             | Containerization for local development and deployment.                                                                                                                        | Podman                                                                             |
| [**shadcn/ui**](https://ui.shadcn.com/)           | Accessible and customizable React component library.                                                                                                                          | Chakra UI, Material UI, Mantine UI                                                 |

## Deployment

This template mounts the Hono API inside the TanStack Start application. Deploy one web service on port `3000`; the API is available at the subpath configured by `VITE_SERVER_URL`, which defaults to `/server`.

### Coolify

1. When creating a new application in Coolify, select "Private Repository (with GitHub App)" and select your repository with your tsu-stack app.
2. Next, change the "Build Pack" to "Docker Compose" and set the "Docker Compose Location" to `/docker-compose.coolify.yaml`.
3. Assign the public domain to the `web` service on port `3000`. Route the configured API subpath to that same service.
4. Set the required [environment variables](#environment-variables), including generated database and auth secrets.
5. Deploy the application.

> [!CAUTION]
> Keep `Strip Prefixes` disabled. TanStack Start and Hono must receive the configured path so `/server` routes correctly.

### Cloudflare Workers

This Node-oriented template is not configured for Workers. A Workers deployment requires changing the runtime adapter, database access, environment bindings, and client-IP handling together. Start from a Cloudflare-specific template instead of changing only the Nitro preset.

### Dokploy

[Dokploy](https://dokploy.com) can deploy the merged application with `apps/web/Dockerfile` and the repository root as its build context. Use the `production` target, expose port `3000`, and route both the web URL and API subpath to this one service.

Provide `VITE_SERVER_URL`, `VITE_WEB_URL`, `DATABASE_URL`, and `BETTER_AUTH_SECRET` as build arguments and runtime variables. Also set `VITE_IMGPROXY_URL` and `VITE_IMGPROXY_SIGNATURE` when using imgproxy.

> [!IMPORTANT]
> Setting only runtime environment variables is not enough: the web build also needs them. Local `.env` files are excluded from the Docker build context, so provide build-time values through Dokploy and rebuild after changing them.

> [!CAUTION]
> The included Dockerfiles consume build arguments, not Dokploy's **Build-time Secrets**. Build arguments can be exposed in build metadata or cache; use non-sensitive build-only values where possible and configure real credentials at runtime. To pass sensitive values during the build, adapt the Dockerfiles to consume secret mounts first. See Dokploy's [environment variables for Dockerfile builds](https://docs.dokploy.com/docs/core/applications/build-type#environment-variables-for-dockerfile-builds).

### Deploying to Other Platforms

TanStack Start uses [Nitro](https://nitro.build) as its server engine. Choose a Node-compatible Nitro deployment target that supports this template's PostgreSQL connection and Node APIs.

> [!CAUTION]
> Changing only the Nitro preset does not make the full stack edge-compatible. Database connections, environment bindings, and runtime-specific APIs must also match the target.

## Environment Variables

The merged TanStack Start and Hono application uses these environment variables:

| Variable Name                   | Required | Default Value | Description                                                                                                                         |
| ------------------------------- | -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SERVER_URL`               | ✅       | -             | Base URL for the server. May also include a subpath if needed, ex: `https://example.com/server`.                                    |
| `VITE_WEB_URL`                  | ✅       | -             | Base URL for the web app. May also include a subpath if needed, ex: `https://example.com/web`.                                      |
| `BETTER_AUTH_SECRET`            | ✅       | -             | Secret key for Better-Auth. Generate with `vp run auth:secret`.                                                                     |
| `BETTER_AUTH_TRUSTED_IP_HEADER` | ❌       | -             | Header a trusted edge overwrites with exactly one validated client IP. Leave empty if requests can bypass it.                       |
| `DATABASE_URL`                  | ✅       | -             | PostgreSQL connection string.                                                                                                       |
| `ENABLE_OPEN_API_DOCS`          | ❌       | `false`       | Enable OpenAPI `/docs` endpoint.                                                                                                    |
| `VITE_IMGPROXY_URL`             | ❌       | -             | URL for image optimization. You'll need to deploy your own [imgproxy](https://hub.docker.com/r/darthsim/imgproxy/) container first. |
| `VITE_IMGPROXY_SIGNATURE`       | ❌       | `_`           | imgproxy signature path segment. Use `insecure` or a precomputed signature if your imgproxy setup requires it.                      |

## Merged Application Architecture

`apps/web/src/routes/server/$.ts` forwards the API subpath to the Hono app exported by `apps/server`. TanStack Start owns the network listener, so `apps/server` is an internal package rather than a separately deployed service.

Keep `VITE_SERVER_URL` on the same public origin as `VITE_WEB_URL` and include the API subpath, for example `https://example.com/server`. The application container needs both web and server environment variables at build time and runtime.

### Resource Usage

One service reduces idle memory and deployment coordination. Web rendering and API traffic share the same process and scaling boundary, so heavy API traffic can also consume capacity needed by the frontend. Split them only when independent scaling is worth the extra service and routing complexity.

## Issue Watchlist

Last verified on November 10, 2026.

- [TanStack Router #7529](https://github.com/TanStack/router/issues/7529) - Keep the Router/Start dependency set pinned because newer `router-core` releases can leave the SSR query stream open until the serialization timeout.
- [TanStack Router #6275](https://github.com/TanStack/router/issues/6275) - Keep the Vite preview host on `127.0.0.1` so Docker prerender builds can reach the preview server.
- [TanStack Router #8550](https://github.com/TanStack/router/issues/8550) - A CSP nonce delivered in a response header can make hydration duplicate inline module scripts because the browser hides the nonce from `getAttribute()`.
- [TanStack Router #8789](https://github.com/TanStack/router/issues/8789) - Hydration scripts can miss a CSP nonce when it is assigned after the router's SSR state is created.

### Pitfalls

- Prefer exposing the web app and API on one public origin, such as `https://example.com` and `https://example.com/server`. Host-only auth cookies then reach authenticated SSR without being shared with sibling subdomains. Different-site auth can also fail in Safari because WebKit's [Intelligent Tracking Prevention (ITP)](https://webkit.org/tracking-prevention/) applies Full Third-Party Cookie Blocking. If separate public origins are unavoidable, test authenticated SSR and OAuth in Safari and configure Better Auth cookies, trusted origins, CORS, and proxy routing deliberately; sibling subdomains are same-site for ITP but still do not share host-only cookies.
- The template does not enforce CSP because the TanStack nonce issues in the watchlist can break hydration. Treat all user-authored HTML as untrusted and sanitize it before rendering. Revisit a strict nonce- or hash-based CSP before adding high-risk script integrations; do not silence CSP errors with `unsafe-inline` as a permanent fix.
- If you change the API's `/server` path or put web and API on different origins, update `VITE_SERVER_URL`, proxy routing, CORS origins, and `OPTIONS` forwarding to match.
- For per-client rate limits, set `BETTER_AUTH_TRUSTED_IP_HEADER` only when a trusted edge removes the client-supplied value and overwrites it with exactly one client IP. If requests can bypass that edge, an attacker can forge the header and evade limits. Leave it empty to use the shared fallback bucket when that guarantee is unavailable.
- If you deploy to production, replace the example `BETTER_AUTH_SECRET` with a generated secret shared by the web app and API.
- If the web app runs under a subpath such as `/web` and you want search engines to discover `robots.txt`, expose it at the [domain root](https://developers.google.com/search/docs/crawling-indexing/robots/intro) through a redirect or root route. For multiple subpath apps, add a root sitemap index and point `__root.tsx` at it if you want the app to advertise that index.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. If there are any bugs, please open an issue.

To get started, fork the repo, make your changes, add, commit, and push your changes to your fork. Then, open a pull request. If you're new to GitHub, [this tutorial](https://www.freecodecamp.org/news/how-to-make-your-first-pull-request-on-github-3) might help.

You can support the project by giving it a star, sharing it with your friends, contributing to the project, and reporting any bugs you find.

## Acknowledgements

This repository builds on [mugnavo/cove-monorepo](https://github.com/mugnavo/cove-monorepo).

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
