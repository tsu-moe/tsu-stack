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
ARG VITE_PLUS_VERSION=0.1.19
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

ARG SOURCE_COMMIT VITE_SERVER_URL VITE_WEB_URL VITE_IMGPROXY_URL DATABASE_URL BETTER_AUTH_SECRET
ENV SOURCE_COMMIT=${SOURCE_COMMIT} \
    VITE_SERVER_URL=${VITE_SERVER_URL} \
    VITE_WEB_URL=${VITE_WEB_URL} \
    VITE_IMGPROXY_URL=${VITE_IMGPROXY_URL} \
    DATABASE_URL=${DATABASE_URL} \
    BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}

RUN vp run -v --filter web build

# =========================================================================== #

FROM base AS production

RUN addgroup --gid 1001 nodejs \
    && adduser --uid 1001 --ingroup nodejs --disabled-password --gecos "" web

COPY --from=builder --chown=web:nodejs /app/apps/web/.output /app/.output

USER web

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}$(echo ${VITE_WEB_URL} | sed 's|^http[s]*://[^/]*||' | sed 's|/$||')/_api/health/live || exit 1

CMD ["node", "/app/.output/server/index.mjs", "--hostname", "0.0.0.0"]