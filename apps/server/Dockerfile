FROM node:25-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y wget \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# =========================================================================== #

FROM base AS installer

# Use `npm view vite-plus version` to get the latest version of vite-plus for reproducible builds
# FIXME: Use the documented manual method when it's available
# @see {@link https://github.com/voidzero-dev/vite-plus/issues/896}
ARG VITE_PLUS_VERSION=0.1.18
RUN npm pack "@voidzero-dev/vite-plus-cli-linux-x64-gnu@${VITE_PLUS_VERSION}" \
        --pack-destination /tmp && \
    mkdir -p /root/.vite-plus/bin && \
    tar xzf /tmp/voidzero-dev-vite-plus-cli-linux-x64-gnu-*.tgz -C /root/.vite-plus/bin \
        --strip-components=1 package/vp && \
    chmod +x /root/.vite-plus/bin/vp
ENV PATH="/root/.vite-plus/bin:$PATH"

# This layer only invalidates when dependencies change, not on source changes.
# --parents preserves directory structure, picking up all workspace packages automatically.
COPY --parents **/package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN vp install --frozen-lockfile --ignore-scripts

# =========================================================================== #

FROM installer AS builder

COPY . .

# Ensure the migrations directory exists so that the build doesn't fail when trying to copy it in the production stage.
RUN mkdir -p packages/db/migrations

ARG SOURCE_COMMIT VITE_SERVER_URL VITE_WEB_URL DATABASE_URL BETTER_AUTH_SECRET
ENV SOURCE_COMMIT=${SOURCE_COMMIT} \
    VITE_SERVER_URL=${VITE_SERVER_URL} \
    VITE_WEB_URL=${VITE_WEB_URL}

RUN vp run -v --filter server build

# =========================================================================== #

FROM base AS production

RUN addgroup --gid 1001 nodejs \
    && adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" server

COPY --from=builder --chown=server:nodejs /app/apps/server/.output /app/.output
COPY --from=builder --chown=server:nodejs /app/packages/db/migrations /app/.output/migrations

USER server

ENV NODE_ENV=production
ENV PORT=5000

# You may want to consider editing the healthcheck if you want to use /health/live (just the server) or /health/ready (all services)
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}$(echo ${VITE_SERVER_URL} | sed 's|^http[s]*://[^/]*||' | sed 's|/$||')/health/live || exit 1

# You may set --max-old-space-size to control the maximum V8 heap size.
# This creates a hard cap on the Node.js JavaScript heap and causes the
# process to exit with an OOM error if exceeded.
# It helps prevent the process from consuming excessive memory,
# but container-level memory limits are the recommended primary safeguard.
CMD ["node", "/app/.output/index.mjs", "--hostname", "0.0.0.0"]
