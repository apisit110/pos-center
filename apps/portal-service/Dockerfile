# syntax=docker/dockerfile:1
# Build context: repo root  ->  docker build -f apps/portal-service/Dockerfile .

ARG NODE_VERSION=22.22.2
ARG ALPINE_VERSION=3.22

# ---------- Stage 1: prune monorepo to this app + its workspace deps ----------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS pruner
WORKDIR /app
RUN npm install -g turbo@2.9.6
COPY . .
RUN turbo prune portal-service --docker

# ---------- Stage 2: install, build, then keep production deps only ----------
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS builder
WORKDIR /app
RUN corepack enable
ENV PNPM_HOME=/pnpm CI=true

COPY .npmrc ./
COPY --from=pruner /app/out/json/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

COPY --from=pruner /app/out/full/ ./
RUN pnpm turbo run build --filter=portal-service

# workspace packages point "main" at src/*.ts for dev; switch to compiled dist for runtime
RUN for p in packages/*/package.json; do \
      node -e "const f='$p',j=require('./'+f);j.main='dist/index.js';j.types='dist/index.d.ts';require('fs').writeFileSync(f,JSON.stringify(j,null,2))"; \
    done

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    find . -name node_modules -type d -prune -exec rm -rf {} + && \
    pnpm install --prod --frozen-lockfile --offline --store-dir /pnpm/store

# ---------- Stage 3: minimal runtime (bare Alpine + node binary only) ----------
FROM alpine:${ALPINE_VERSION} AS runner
RUN apk add --no-cache libstdc++ tini && \
    addgroup -S app && adduser -S app -G app
COPY --from=builder /usr/local/bin/node /usr/local/bin/node

WORKDIR /app
ENV NODE_ENV=production PORT=4001

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/packages ./packages
COPY --from=builder --chown=app:app /app/apps/portal-service/package.json ./apps/portal-service/package.json
COPY --from=builder --chown=app:app /app/apps/portal-service/node_modules ./apps/portal-service/node_modules
COPY --from=builder --chown=app:app /app/apps/portal-service/dist ./apps/portal-service/dist

USER app
EXPOSE 4001
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/portal-service/dist/index.js"]
