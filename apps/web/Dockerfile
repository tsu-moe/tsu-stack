FROM ghcr.io/voidzero-dev/vite-plus:1.8.0 AS installer

WORKDIR /app

# This layer only invalidates when dependencies change, not on source changes.
# --parents preserves directory structure, picking up all workspace packages automatically.
COPY --chown=vp:vp --parents **/package.json pnpm-lock.yaml pnpm-workspace.yaml .node-version ./

RUN vp install --frozen-lockfile --ignore-scripts

# =========================================================================== #

FROM installer AS migrator

COPY --chown=vp:vp . .

CMD ["vp", "run", "db:migrate"]

# =========================================================================== #

FROM installer AS builder

COPY --chown=vp:vp . .

ARG SOURCE_COMMIT VITE_SERVER_URL VITE_WEB_URL VITE_IMGPROXY_URL VITE_IMGPROXY_SIGNATURE

# Use the example environment for tests and build-time validation.
RUN --mount=type=bind,source=packages/env/.env.example,target=/app/packages/env/.env \
    vp run test:unit:run \
    && vp run -v --filter web build
RUN cp "$(vp env which node | sed -n '1p')" /tmp/node

# =========================================================================== #

FROM debian:bookworm-slim AS production

RUN apt-get update \
  && apt-get install -y --no-install-recommends wget ca-certificates libatomic1 \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN addgroup --gid 1001 nodejs \
    && adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" web

COPY --from=builder /tmp/node /usr/local/bin/node
COPY --from=builder --chown=web:nodejs /app/apps/web/.output /app/.output

USER web

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}$(echo ${VITE_WEB_URL} | sed 's|^http[s]*://[^/]*||' | sed 's|/$||')/_api/health/live || exit 1

CMD ["node", "/app/.output/server/index.mjs", "--hostname", "0.0.0.0"]
