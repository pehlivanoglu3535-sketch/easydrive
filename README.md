# ProKosova Solutions — Kurumsal Web Sitesi

Çok disiplinli bir danışmanlık şirketi için tanıtım sitesi + yönetim paneli.
İş & yönetim, mali müşavirlik, göçmenlik ve yazılım danışmanlığı hizmetlerini
tanıtır; ziyaretçilerden iletişim/teklif talebi ve online randevu toplar.

**Teknolojiler:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma (SQLite) · jose + bcrypt (oturum)

## Özellikler

- **Tanıtım sayfaları:** Ana sayfa, Hizmetler (liste + detay), Hakkımızda (ekip), Blog (liste + detay), İletişim.
- **İletişim / teklif formu:** Doğrulama + bot koruması; talepler panele düşer.
- **Online randevu:** İş günlerine göre otomatik boş saat üretimi, çift rezervasyon engeli.
- **Blog / makaleler:** Panelden yazı ekleme/düzenleme/yayınlama.
- **Yönetim paneli (`/admin`):** Mesajlar, randevular, blog yazıları ve hizmet içeriklerinin yönetimi.

## Hızlı başlangıç

```bash
# 1) Bağımlılıklar
npm install

# 2) Ortam değişkenleri
cp .env.example .env

# 3) Veritabanı + örnek içerik (hizmetler, blog, ekip, admin kullanıcı)
npx prisma migrate dev
npm run seed

# 4) Geliştirme sunucusu
npm run dev
```

Site: http://localhost:3000 — Panel: http://localhost:3000/admin

**Varsayılan yönetici girişi:** `admin@prokosovasolutions.com` / `admin1234`
(`.env` içinden `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` ile değiştirilebilir.)

## Yapı

```
src/
  app/
    (site)/            # herkese açık site (ortak header/footer layout)
      page.tsx         # ana sayfa
      hizmetler/       # hizmet liste + [slug] detay
      hakkimizda/      # hakkımızda + ekip
      blog/            # blog liste + [slug] detay
      iletisim/        # iletişim / teklif formu
      randevu/         # online randevu
    admin/             # yönetim paneli (oturum korumalı)
    login/             # yönetici girişi
  components/          # Logo, SiteHeader/Footer, formlar, ServiceIcon, RichText…
  lib/
    site-config.ts     # marka adı, iletişim bilgileri, menü (tek düzenleme noktası)
    actions/           # server action'lar (contact, appointment, auth, admin)
    appointments.ts    # randevu slot üretimi
prisma/schema.prisma   # veri modeli
```

## Özelleştirme

- **Marka / iletişim bilgileri:** `src/lib/site-config.ts`
- **Renk teması:** `src/app/globals.css` (`:root` içindeki `--brand*` / `--accent*` değişkenleri)
- **Hizmet ve blog içeriği:** Yönetim panelinden veya `prisma/seed.ts` üzerinden

> Not: Markayı değiştirmek için `site-config.ts` yeterlidir; logo `src/components/Logo.tsx` içindeki SVG'dir.
