# ProKosova Solutions — Kurumsal Web Sitesi

Kosova'da şirket kuruluşu, oturum/çalışma izni, muhasebe ve yatırım danışmanlığı sunan
ProKosova Solutions için tanıtım sitesi + yönetim paneli. Tamamen **Cloudflare** üzerinde çalışır.

**Teknolojiler:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
**Cloudflare Workers** (OpenNext) · **Cloudflare D1** (SQLite) · Drizzle ORM · jose + Web Crypto (oturum)

## Özellikler

- **Tanıtım sayfaları:** Ana sayfa, Hizmetler (liste + detay), Hakkımızda (kurucu), Blog, İletişim.
- **İletişim / teklif formu** ve **online randevu** (otomatik boş saat üretimi, çift rezervasyon engeli).
- **Blog / makaleler** — panelden ekleme/düzenleme/yayınlama.
- **Yönetim paneli (`/admin`):** Mesajlar, randevular, blog ve hizmet yönetimi.

## Yerel geliştirme

Veritabanı Cloudflare D1'dir; yerelde wrangler (miniflare) ile taklit edilir.

```bash
# 1) Bağımlılıklar
npm install

# 2) Ortam (sadece seed üretimi için) + yerel oturum anahtarı
cp .env.example .env
echo 'AUTH_SECRET="dev-secret-degistir"' > .dev.vars

# 3) Seed SQL üret (admin + hizmet/blog/ekip)
npm run gen:seed

# 4) Yerel D1'e şema + veri uygula
npm run d1:schema:local
npm run d1:seed:local

# 5) Workers önizlemesi (gerçek çalışma ortamı)
npm run cf:preview
```

Önizleme `http://localhost:8787` (port çıktıda yazar). Panel: `/admin`.
**Varsayılan yönetici:** `admin@prokosovasolutions.com` / `admin1234`

> `npm run dev` (saf `next dev`) da çalışır, ancak D1 davranışını birebir görmek için
> `npm run cf:preview` önerilir.

## Yapı

```
src/
  app/
    (site)/            # herkese açık site (header/footer layout)
      page.tsx · hizmetler/ · hakkimizda/ · blog/ · iletisim/ · randevu/
    admin/             # yönetim paneli (oturum korumalı)
    login/
  components/          # Logo, SiteHeader/Footer, formlar, ServiceIcon, RichText…
  lib/
    schema.ts          # Drizzle veri modeli (D1 tabloları)
    db.ts              # D1 binding → Drizzle örneği
    site-config.ts     # marka, iletişim, kurucu, istatistikler (tek düzenleme noktası)
    password.mjs       # Web Crypto (PBKDF2) şifre hash'leme
    actions/           # server action'lar (contact, appointment, auth, admin)
cloudflare/
  schema.sql           # D1 tablo DDL'i (schema.ts ile eşleşir)
  seed.sql             # başlangıç verisi (gen:seed ile üretilir)
  seed-data.mjs        # hizmet/blog/ekip içerik kaynağı
wrangler.jsonc         # Worker + D1 binding yapılandırması
open-next.config.ts    # OpenNext (Next.js → Workers) adaptörü
```

## Canlıya alma

Cloudflare Workers + D1 + özel domain adımları için **[DEPLOY.md](./DEPLOY.md)**.

## Özelleştirme

- **Marka / iletişim / kurucu / istatistikler:** `src/lib/site-config.ts`
- **Renk teması:** `src/app/globals.css` (`--brand*` / `--accent*`)
- **Logo:** `public/logo.png` (header/footer), `src/app/icon.png` (favicon)
- **Başlangıç içeriği:** `cloudflare/seed-data.mjs` → `npm run gen:seed`
