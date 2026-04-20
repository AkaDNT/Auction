# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

FROM base AS pruner
ARG TURBO_VERSION=2.5.6
RUN npm i -g turbo@${TURBO_VERSION}
COPY . .
RUN turbo prune worker --docker

FROM base AS prod-deps
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev \
 && find node_modules -type f \( \
  -name "*.md" -o \
  -name "*.markdown" -o \
  -name "*.ts" -o \
  -name "*.tsx" -o \
  -name "CHANGELOG*" -o \
  -name "LICENSE*" \
 \) -delete

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

RUN --mount=type=cache,target=/root/.npm npm ci

COPY --from=pruner /app/out/full/ ./

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN npm --workspace packages/db run prisma:generate \
 && npm --workspace packages/db run build \
 && npm --workspace packages/shared run build \
 && npm --workspace apps/worker run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder --chown=node:node /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder --chown=node:node /app/apps/worker/dist ./apps/worker/dist

COPY --from=builder --chown=node:node /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder --chown=node:node /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=node:node /app/packages/db/prisma ./packages/db/prisma

COPY --from=builder --chown=node:node /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder --chown=node:node /app/packages/shared/dist ./packages/shared/dist

USER node
CMD ["node", "apps/worker/dist/main"]