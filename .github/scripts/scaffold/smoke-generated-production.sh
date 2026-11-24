#!/usr/bin/env bash
set -euo pipefail

variant="$1"
vp="$2"
verify="$3"
export VITE_WEB_URL=http://127.0.0.1:3000/web
export VITE_SERVER_URL="$VITE_WEB_URL/server"
export BETTER_AUTH_SECRET="$(openssl rand -hex 32)"
export WRANGLER_SEND_METRICS=false

postgres=""
api_pid=""
web_pid=""
cleanup() {
  if [[ -n "$web_pid" ]]; then kill -- "-$web_pid" 2>/dev/null || true; fi
  if [[ -n "$api_pid" ]]; then kill -- "-$api_pid" 2>/dev/null || true; fi
  if [[ -n "$postgres" ]]; then docker stop "$postgres" >/dev/null || true; fi
}
trap cleanup EXIT

if [[ "$variant" == separate ]]; then
  export VITE_SERVER_URL=http://127.0.0.1:5000/server
fi

if [[ "$variant" != cloudflare-d1 ]]; then
  postgres="$(docker run --detach --rm \
    -e POSTGRES_PASSWORD=smoke-only -e POSTGRES_DB=tsu_stack_smoke \
    -p 127.0.0.1::5432 postgres:18-alpine)"
  mapping="$(docker port "$postgres" 5432/tcp)"
  export DATABASE_URL="postgresql://postgres:smoke-only@127.0.0.1:${mapping##*:}/tsu_stack_smoke"
  for ((i=0; i<30; i++)); do
    if docker exec "$postgres" pg_isready -h 127.0.0.1 -U postgres -d tsu_stack_smoke >/dev/null; then
      break
    fi
    sleep 1
  done
  docker exec "$postgres" pg_isready -h 127.0.0.1 -U postgres -d tsu_stack_smoke >/dev/null
fi

if [[ "$variant" == cloudflare* ]]; then
  (
    umask 077
    printf 'VITE_WEB_URL=%s\nVITE_SERVER_URL=%s\nBETTER_AUTH_SECRET=%s\n' \
      "$VITE_WEB_URL" "$VITE_SERVER_URL" "$BETTER_AUTH_SECRET"
    if [[ "$variant" == cloudflare ]]; then
      printf 'DATABASE_URL=%s\n' "$DATABASE_URL"
    fi
  ) > apps/web/.dev.vars
fi

if [[ "$variant" == cloudflare-d1 ]]; then
  "$vp" run db:migrate:local
elif [[ "$variant" != separate ]]; then
  "$vp" run db:migrate
fi
"$vp" run build

if [[ "$variant" == merged ]]; then
  test -d apps/web/.output/server/migrations
fi

if [[ "$variant" == separate ]]; then
  setsid env NODE_ENV=production node apps/server/.output/index.mjs &
  api_pid="$!"
fi

if [[ "$variant" == cloudflare* ]]; then
  (
    cd apps/web
    exec setsid "$vp" run preview --host 127.0.0.1 --port 3000 --strictPort
  ) &
else
  setsid env NODE_ENV=production HOST=127.0.0.1 PORT=3000 node apps/web/.output/server/index.mjs &
fi
web_pid="$!"

for ((i=0; i<60; i++)); do
  if curl -fsS --max-time 2 "$VITE_WEB_URL/" >/dev/null &&
    curl -fsS --max-time 2 "$VITE_SERVER_URL/health/live" >/dev/null; then
    node "$verify"
    exit
  fi
  sleep 1
done

echo "Production fixture did not start for $variant" >&2
exit 1
