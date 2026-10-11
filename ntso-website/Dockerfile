# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Public URL is baked into security headers (HSTS / upgrade-insecure-requests) and metadata at build time.
ARG APP_URL=https://ntso.in
ARG NEXT_PUBLIC_SITE_URL=https://ntso.in
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NEXT_TELEMETRY_DISABLED=1 APP_URL=$APP_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN npx prisma generate && npx next build

FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/data/uploads
COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
# Prisma CLI + schema for `prisma migrate deploy` at start-up
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/prisma ./node_modules/prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p /data/uploads && chown -R app:app /data
USER app
EXPOSE 3000
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
