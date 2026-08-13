# RentFlow — Production'a Alma Rehberi

Kosova araç kiralama SaaS platformu. Next.js 16 + Prisma + PostgreSQL, tek `docker compose` ile.

Bu kurulum **host-bağımsız**: düz bir VPS'te, Coolify'da veya Dokku'da aynı şekilde çalışır.
Uygulama, veritabanı ve yüklenen dosyalar (logo, araç fotoğrafları, imzalar) kalıcıdır.

---

## Hızlı başlangıç (VPS + Docker)

Sunucuda Docker + Docker Compose kurulu olmalı.

```bash
# 1) Projeyi sunucuya alın (git clone veya scp)
cd rentacar

# 2) Ortam dosyasını hazırlayın
cp .env.production.example .env
#    .env içini doldurun:
#    - POSTGRES_PASSWORD : güçlü bir şifre
#    - AUTH_SECRET       : openssl rand -base64 48
#    - SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD : ilk giriş için

# 3) Ayağa kaldırın (imajı derler, DB'yi kurar, şemayı uygular, süper-admin'i oluşturur)
docker compose up -d --build

# 4) Logları izleyin
docker compose logs -f app
```

Uygulama `http://SUNUCU_IP:3000` adresinde açılır. `/login` → süper-admin bilgilerinizle girin → `/admin`.

### İlk açılışta ne olur?
- `db` servisi (Postgres 16) kalıcı `pgdata` volume'u ile başlar.
- `app` entrypoint'i şemayı `prisma db push` ile Postgres'e uygular (tabloları oluşturur).
- `SUPER_ADMIN_EMAIL/PASSWORD` verilmişse süper-admin oluşturulur (idempotent; varsa dokunmaz).
- Firmalar **elle** eklenir (`/admin`) — demo veri yüklenmez.

> Güvenlik: Süper-admin oluşturulduktan sonra `.env` içindeki `SUPER_ADMIN_PASSWORD` satırını
> boşaltıp `docker compose up -d` ile yeniden başlatabilirsiniz.

---

## HTTPS (production'da zorunlu)

Cookie'ler `NODE_ENV=production` altında `secure` olduğundan, uygulama **HTTPS arkasında** çalışmalı.
Bir reverse proxy kullanın:

- **Caddy** (en kolay, otomatik Let's Encrypt): `app:3000`'e ters vekil.
- **Nginx / Traefik**: TLS sonlandırma + `proxy_pass http://127.0.0.1:3000`.
- **Coolify / Dokku**: TLS'i kendileri yönetir; sadece uygulama portunu tanıtın.

Örnek `Caddyfile`:
```
rentflow.senindomainin.com {
    reverse_proxy 127.0.0.1:3000
}
```

---

## Coolify / Dokku ile

- **Coolify**: "Docker Compose" kaynağı olarak bu repo'yu ekleyin; `.env` değişkenlerini panelde girin.
  `pgdata` ve `uploads` volume'ları kalıcı kalır; TLS otomatik.
- **Dokku**: `Dockerfile` tabanlı deploy + `dokku postgres` eklentisi. `uploads` için kalıcı storage mount edin:
  `dokku storage:mount rentflow /var/lib/dokku/data/storage/rentflow-uploads:/app/public/uploads`.

Harici (yönetilen) Postgres kullanacaksanız compose'taki `db` servisini kaldırıp
`DATABASE_URL`'i doğrudan verin.

---

## Yedekleme

```bash
# Veritabanı yedeği
docker compose exec db pg_dump -U rentflow rentflow > yedek-$(date +%F).sql

# Yüklenen dosyalar (logo/foto/imza)
docker run --rm -v rentacar_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Geri yükleme: `pg_dump` çıktısını `psql` ile, tar'ı ilgili volume'a açın.

---

## Güncelleme

```bash
git pull
docker compose up -d --build
```

Şema değişmişse entrypoint `prisma db push` ile otomatik senkronlar.

---

## Güvenlik kontrol listesi

- [ ] `AUTH_SECRET` güçlü ve gizli (production'da eksikse uygulama başlamaz)
- [ ] `POSTGRES_PASSWORD` güçlü
- [ ] HTTPS arkasında (reverse proxy + TLS)
- [ ] Süper-admin ilk şifresi değiştirildi, `.env`'den `SUPER_ADMIN_PASSWORD` temizlendi
- [ ] Sunucu firewall'u: yalnızca 80/443 dışarı açık; 3000 ve 5432 yalnızca yerel
- [ ] Düzenli DB + uploads yedeği

---

## Yerel geliştirme (değişmedi)

Yerelde **SQLite** kullanılmaya devam eder (Windows, Docker gerektirmez):
```bash
npm install
npm run dev
```
`prisma/schema.prisma` yerelde `provider = "sqlite"` kalır; Docker imajı derlenirken
`scripts/use-postgres.mjs` bunu imaj içinde `postgresql` yapar. Committed dosya değişmez.

---

## Roller ve rotalar

| Rol | Giriş | Alan |
|-----|-------|------|
| Süper Admin | `/login` | `/admin` — firmalar, abonelik, faturalar |
| Firma Yöneticisi / Personel | `/login` | `/panel` — filo, rezervasyon, sözleşme, fiyat, rapor |
| Araç Teslim Personeli | `/login` | `/panel/handover` — teslim/iade formu |

Her firmanın markalı sitesi: `/s/<slug>` (kendi logo + rengi, misafir rezervasyon).
Paneller 3 dilli (sq/en/tr); süper-admin paneli sabit.
