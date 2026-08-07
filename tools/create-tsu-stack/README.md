# create-tsu-stack

Interactive and automation-friendly scaffolding for [tsu-stack](https://github.com/tsu-moe/tsu-stack).

The CLI requires Node.js 22.18 or newer. Generated projects follow the repository's [current Node.js and Vite Plus prerequisites](https://github.com/tsu-moe/tsu-stack#getting-started).

```bash
npm create tsu-stack@latest my-app
# or
vpx create-tsu-stack@latest my-app
```

The default guided flow asks for project identity, deployment variant, dependency installation, Git initialization, and optional local setup. For automation, every prompt has a flag equivalent:

```bash
vpx create-tsu-stack@latest my-app \
  --display-name "My App" \
  --scope @my-app \
  --variant cloudflare \
  --install \
  --git \
  --setup none \
  --yes
```

`--yes` defaults to `separate`, installs dependencies, initializes Git, and does not provision a database or cloud resource. Use `--dry-run` to resolve the source commit and inspect the exact replay command without writing or running setup commands.

## Variants

- `separate`: separate TanStack Start web and Node/Hono server applications (`main`)
- `merged`: merged web and server for Node deployment (`variant/merged`)
- `cloudflare`: merged web and server for Cloudflare Workers (`variant/merged-cloudflare`)
- `cloudflare-d1`: merged Cloudflare Worker using D1 (`variant/merged-cloudflare-d1`)

For `cloudflare-d1`, `--setup local` creates the local environment and applies local D1 migrations without Docker. `--setup cloudflare` explicitly authenticates Wrangler, creates a project-named remote D1 database, writes its binding to `apps/web/wrangler.jsonc`, and applies remote migrations. Other variants use PostgreSQL and Docker for guided local setup.

Generated projects include `.tsu-stack.jsonc` with their inputs, source branch, immutable commit SHA, and replay command. The CLI itself, its maintainer-only `.agents/cli.md`, and the inherited lockfile are removed before generation completes.

Run `create-tsu-stack --help` for all options. Maintainer development and release details live in [the CLI agent guide](../../.agents/cli.md).
