# ProKosova Solutions — Production'a Alma Rehberi

Kurumsal danışmanlık web sitesi (tanıtım + yönetim paneli). Next.js 16 + Prisma + PostgreSQL,
tek `docker compose` ile.

Bu kurulum **host-bağımsız**: düz bir VPS'te, Coolify'da veya Dokku'da aynı şekilde çalışır.
Uygulama ve veritabanı (iletişim mesajları, randevular, blog yazıları, hizmetler) kalıcıdır.

---

## Hızlı başlangıç (VPS + Docker)

Sunucuda Docker + Docker Compose kurulu olmalı.

```bash
# 1) Projeyi sunucuya alın (git clone veya scp)
cd easydrive

# 2) Ortam dosyasını hazırlayın
cp .env.production.example .env
#    .env içini doldurun:
#    - POSTGRES_PASSWORD : güçlü bir şifre
#    - AUTH_SECRET       : openssl rand -base64 48
#    - ADMIN_EMAIL / ADMIN_PASSWORD : ilk yönetici girişi için

# 3) Ayağa kaldırın (imajı derler, DB'yi kurar, şemayı uygular, admini + içeriği oluşturur)
docker compose up -d --build

# 4) Logları izleyin
docker compose logs -f app
```

Uygulama `http://SUNUCU_IP:3000` adresinde açılır. `/login` → yönetici bilgilerinizle girin → `/admin`.

### İlk açılışta ne olur?
- `db` servisi (Postgres 16) kalıcı `pgdata` volume'u ile başlar.
- `app` entrypoint'i şemayı `prisma db push` ile Postgres'e uygular (tabloları oluşturur).
- `ADMIN_EMAIL/PASSWORD` verilmişse yönetici oluşturulur (idempotent; varsa dokunmaz).
- Başlangıç içeriği (4 hizmet, 4 blog yazısı, ekip) **yalnızca ilgili tablolar boşsa** eklenir —
  böylece panelden yaptığınız düzenlemeler yeniden deploy'da ezilmez.

> Güvenlik: Yönetici oluşturulduktan sonra `.env` içindeki `ADMIN_PASSWORD` satırını
> boşaltıp `docker compose up -d` ile yeniden başlatabilirsiniz.

---

## HTTPS (production'da zorunlu)

Cookie'ler `NODE_ENV=production` altında `secure` olduğundan, uygulama **HTTPS arkasında** çalışmalı.

### Seçenek A — Dahil edilen Caddy (en kolay, otomatik Let's Encrypt)

`.env` içine `DOMAIN=alanadiniz.com` yazın, DNS A kaydını sunucu IP'sine yönlendirin ve:

```bash
docker compose --profile proxy up -d
```

Caddy 80/443'ü dinler, sertifikayı otomatik alır ve `app:3000`'e vekil yapar.
`www` otomatik olarak köke yönlendirilir (bkz. `Caddyfile`).

### Seçenek B — Mevcut reverse proxy (Nginx / Traefik / Coolify / Dokku)

Caddy profilini başlatmayın; TLS'i proxy'niz yönetsin ve `127.0.0.1:3000`'e `proxy_pass` yapın.
Örnek Nginx:

```nginx
server {
  server_name alanadiniz.com;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
}
```

---

## Coolify / Dokku ile

- **Coolify**: "Docker Compose" kaynağı olarak bu repo'yu ekleyin; `.env` değişkenlerini panelde girin.
  `pgdata` volume'u kalıcı kalır; TLS otomatik.
- **Dokku**: `Dockerfile` tabanlı deploy + `dokku postgres` eklentisi (`DATABASE_URL`'i verir).

Harici (yönetilen) Postgres kullanacaksanız compose'taki `db` servisini kaldırıp
`DATABASE_URL`'i doğrudan verin.

---

## Yedekleme

```bash
# Veritabanı yedeği
docker compose exec db pg_dump -U meridyen meridyen > yedek-$(date +%F).sql
```

Geri yükleme: `pg_dump` çıktısını `psql` ile açın.

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
- [ ] HTTPS arkasında (dahili Caddy veya reverse proxy + TLS)
- [ ] Yönetici ilk şifresi değiştirildi, `.env`'den `ADMIN_PASSWORD` temizlendi
- [ ] Sunucu firewall'u: yalnızca 80/443 dışarı açık; 3000 ve 5432 yalnızca yerel
- [ ] Düzenli DB yedeği

---

## Yerel geliştirme

Yerelde **SQLite** kullanılır (Docker gerektirmez):

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run seed      # örnek içerik + admin (admin@prokosovasolutions.com / admin1234)
npm run dev
```

`prisma/schema.prisma` yerelde `provider = "sqlite"` kalır; Docker imajı derlenirken
`scripts/use-postgres.mjs` bunu imaj içinde `postgresql` yapar. Committed dosya değişmez.

---

## Rotalar

| Alan | Rota | Açıklama |
|------|------|----------|
| Herkese açık site | `/` | Ana sayfa, hizmetler, hakkımızda, blog, iletişim, randevu |
| Yönetici girişi | `/login` | Oturum açma |
| Yönetim paneli | `/admin` | Mesajlar, randevular, blog yazıları, hizmetler |

Başlangıç içeriği `prisma/seed-data.mjs` dosyasında; marka/iletişim bilgileri `src/lib/site-config.ts`.
