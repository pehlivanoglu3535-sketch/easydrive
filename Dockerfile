# ─── RentFlow production imajı (Next.js 16 standalone + Prisma + Postgres) ───
# Çok aşamalı: deps → builder → runner. Küçük, güvenli runtime imajı.

FROM node:22-slim AS base
# Prisma engine'i için OpenSSL gerekli.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ─── 1) Bağımlılıklar ───
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ─── 2) Derleme ───
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# datasource provider'ını postgresql yap (yerel schema sqlite kalır, imaj içinde değişir).
RUN node scripts/use-postgres.mjs
# Prisma client üret (Linux binary hedefiyle).
RUN npx prisma generate
# Derleme sırasında DB bağlantısı gerekmez; boş bir değer yeterli.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── 3) Runtime ───
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Root olmayan kullanıcı.
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone çıktı: server.js + minimum node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI + üretilen client/engine + şema + scriptler (db push ve admin bootstrap için).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Yükleme klasörü (volume mount noktası) — yazılabilir olmalı.
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
