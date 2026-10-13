#!/bin/sh
set -e

echo "[entrypoint] Veritabanı bekleniyor & şema senkronlanıyor…"

# Şemayı Postgres'e uygula. İlk açılışta tabloları oluşturur; sonraki açılışlarda
# fark yoksa hızlı geçer. Bağlantı hazır olana kadar birkaç kez dener.
tries=0
until node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss; do
  tries=$((tries + 1))
  if [ "$tries" -ge 10 ]; then
    echo "[entrypoint] Veritabanına bağlanılamadı (10 deneme)." >&2
    exit 1
  fi
  echo "[entrypoint] DB henüz hazır değil, 3s sonra tekrar… ($tries/10)"
  sleep 3
done

# Yönetici bootstrap (ADMIN_EMAIL/ADMIN_PASSWORD verilmişse; idempotent).
node scripts/create-admin.mjs || echo "[entrypoint] create-admin atlandı."

# Başlangıç içeriği (hizmet/blog/ekip) — yalnızca tablolar boşsa ekler.
node scripts/seed-content.mjs || echo "[entrypoint] seed-content atlandı."

echo "[entrypoint] Uygulama başlatılıyor: $*"
exec "$@"
