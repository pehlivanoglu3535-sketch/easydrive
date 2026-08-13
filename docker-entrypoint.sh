#!/bin/sh
set -e

echo "[entrypoint] Veritabanı bekleniyor & şema senkronlanıyor…"

# Şemayı Postgres'e uygula. İlk açılışta tabloları oluşturur; sonraki açılışlarda
# fark yoksa hızlı geçer. (Migration geçmişi olmadan doğrudan senkron — tek uygulama SaaS için güvenli.)
# Bağlantı hazır olana kadar birkaç kez dene (compose'ta db healthcheck de var).
tries=0
until node node_modules/prisma/build/index.js db push --skip-generate; do
  tries=$((tries + 1))
  if [ "$tries" -ge 10 ]; then
    echo "[entrypoint] Veritabanına bağlanılamadı (10 deneme)." >&2
    exit 1
  fi
  echo "[entrypoint] DB henüz hazır değil, 3s sonra tekrar… ($tries/10)"
  sleep 3
done

# Süper admin bootstrap (env verilmişse; idempotent).
node scripts/create-admin.mjs || echo "[entrypoint] create-admin atlandı."

echo "[entrypoint] Uygulama başlatılıyor: $*"
exec "$@"
