# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
# Self-contained Prisma CLI (same pinned version) for running `migrate deploy` in the runtime image.
RUN mkdir -p /prisma-cli && cd /prisma-cli && npm init -y >/dev/null \
 && npm install --omit=dev --no-audit --no-fund "prisma@$(node -p "require('/app/node_modules/prisma/package.json').version")"

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public URL is baked into security headers (HSTS / upgrade-insecure-requests) and metadata at build time.
ARG APP_URL=https://ntso.in
ARG NEXT_PUBLIC_SITE_URL=https://ntso.in
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NEXT_TELEMETRY_DISABLED=1 APP_URL=$APP_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npx prisma generate && npx next build && npm run build:ops

FROM node:22-alpine AS runner
WORKDIR /app
# OpenSSL 3 (needed by Prisma) ships in the node:22-alpine base image.
RUN addgroup -S -g 1001 app && adduser -S -u 1001 -G app app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/data/uploads
COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
# Prisma schema + migrations and the standalone CLI for `migrate deploy` at start-up
COPY --from=build /app/prisma ./prisma
COPY --from=deps /prisma-cli /prisma-cli
# Operational scripts (bundled JS): node ops/seed.js · node ops/create-admin.js · node ops/maintenance.js
COPY --from=build /app/ops ./ops
COPY docker-entrypoint.js ./docker-entrypoint.js
RUN mkdir -p /data/uploads && chown -R app:app /data
# The entrypoint starts as root only to fix ownership of a mounted upload disk, then runs
# migrations and the server as the unprivileged `app` user (uid/gid 1001).
EXPOSE 3000
CMD ["node", "docker-entrypoint.js"]
