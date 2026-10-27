# syntax=docker/dockerfile:1
# Build context: repo root  ->  docker build -f apps/portal/Dockerfile --secret id=node_auth_token,env=NODE_AUTH_TOKEN .

ARG NODE_VERSION=22.22.2
ARG ALPINE_VERSION=3.22

# ---------- Stage 1: prune monorepo to this app + its workspace deps ----------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS pruner
WORKDIR /app
RUN npm install -g turbo@2.9.6
COPY . .
RUN turbo prune portal --docker

# ---------- Stage 2: install + next build (standalone output) ----------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder
WORKDIR /app
RUN corepack enable
ENV PNPM_HOME=/pnpm CI=true NEXT_TELEMETRY_DISABLED=1

COPY .npmrc ./
COPY --from=pruner /app/out/json/ ./
# @apisit110/pos-ui lives on GitHub Packages -> token comes in as a build secret
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=secret,id=node_auth_token \
    NODE_AUTH_TOKEN="$(cat /run/secrets/node_auth_token 2>/dev/null || true)" \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY --from=pruner /app/out/full/ ./
# NEXT_PUBLIC_* is inlined into the client bundle at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:4001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm turbo run build --filter=portal

# ---------- Stage 3: minimal runtime (bare Alpine + node binary only) ----------
FROM alpine:${ALPINE_VERSION} AS runner
RUN apk add --no-cache libstdc++ tini && \
    addgroup -S app && adduser -S app -G app
COPY --from=builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=4000 HOSTNAME=0.0.0.0

COPY --from=builder --chown=app:app /app/apps/portal/.next/standalone ./
COPY --from=builder --chown=app:app /app/apps/portal/.next/static ./apps/portal/.next/static
COPY --from=builder --chown=app:app /app/apps/portal/public ./apps/portal/public

USER app
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:${PORT}/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/portal/server.js"]
