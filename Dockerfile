# ─── ProKosova Solutions production imajı (Next.js 16 + Prisma + Postgres) ───
# Çok aşamalı: builder (tam kurulum + derleme) → runner (dev bağımlılıkları çıkarılmış).
# Prisma normal bir "dependency" olduğu için CLI (db push) runtime'da tam çalışır.

FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ─── Derleme ───
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# datasource provider'ını postgresql yap (yerel schema sqlite kalır, imaj içinde değişir).
RUN node scripts/use-postgres.mjs
# Prisma client üret (Linux binary hedefiyle).
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# Dev bağımlılıklarını çıkar (prisma + next "dependency" olduğu için kalır).
RUN npm prune --omit=dev

# ─── Runtime ───
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Root olmayan kullanıcı.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
