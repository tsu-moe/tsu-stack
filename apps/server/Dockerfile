FROM ghcr.io/voidzero-dev/vite-plus:1.1.0 AS installer

WORKDIR /app

COPY --chown=vp:vp --parents **/package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./

RUN vp install --frozen-lockfile --ignore-scripts

FROM installer AS migrator

COPY --chown=vp:vp . .

CMD ["vp", "run", "db:migrate"]

FROM installer AS builder

COPY --chown=vp:vp . .

RUN mkdir -p packages/db/migrations

ARG SOURCE_COMMIT VITE_SERVER_URL VITE_WEB_URL

# Use the example environment for tests and build-time validation.
RUN --mount=type=bind,source=packages/env/.env.example,target=/app/packages/env/.env \
    vp run test:unit:run \
    && pnpm dotenvx run -f packages/env/.env -- vp run -v --filter server build
RUN cp "$(vp env which node | sed -n '1p')" /tmp/node

FROM debian:bookworm-slim AS production

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget ca-certificates libatomic1 \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN addgroup --gid 1001 nodejs \
    && adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" server

COPY --from=builder /tmp/node /usr/local/bin/node
COPY --from=builder --chown=server:nodejs /app/apps/server/.output /app/.output

USER server

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}$(echo ${VITE_SERVER_URL} | sed 's|^http[s]*://[^/]*||' | sed 's|/$||')/health/live || exit 1

CMD ["node", "/app/.output/index.mjs", "--hostname", "0.0.0.0"]
