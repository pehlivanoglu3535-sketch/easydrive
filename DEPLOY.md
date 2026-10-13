# ProKosova Solutions — Cloudflare'e Canlıya Alma

Site tamamen Cloudflare üzerinde çalışır: **uygulama → Cloudflare Workers**,
**veritabanı → Cloudflare D1**, **domain/SSL → Cloudflare**. Ücretsiz katman bu site için yeterlidir.

Aşağıdaki adımlar bir terminalde (bu repo klonlanmış halde) çalıştırılır.

---

## 1. Cloudflare girişi

```bash
npx wrangler login
```
Tarayıcı açılır; Cloudflare hesabınızla yetki verin.

## 2. D1 veritabanı oluştur

```bash
npx wrangler d1 create prokosova-db
```
Çıktıdaki **`database_id`** değerini kopyalayın ve `wrangler.jsonc` içindeki
`d1_databases[0].database_id` alanına yapıştırın (placeholder `00000000-...` yerine).

## 3. Şema + başlangıç verisini uzak D1'e uygula

```bash
# (gerekirse önce kendi admin bilginizle seed üretin)
#   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run gen:seed

npm run d1:schema      # cloudflare/schema.sql → uzak D1
npm run d1:seed        # cloudflare/seed.sql   → uzak D1 (admin + içerik)
```

## 4. Oturum anahtarını (secret) ayarla

```bash
npx wrangler secret put AUTH_SECRET
```
İstendiğinde güçlü bir değer yapıştırın (`openssl rand -base64 48` ile üretebilirsiniz).

## 5. Deploy

```bash
npm run cf:deploy
```
Bu komut uygulamayı build edip Workers'a yükler. Çıktıda `*.workers.dev` adresi verilir;
oradan siteyi test edebilirsiniz.

## 6. Özel domain: `kosovadayasam.com`

Domain zaten Cloudflare'de olduğu için birkaç tık:

1. Cloudflare Dashboard → **Workers & Pages** → `prokosova-solutions` worker'ı.
2. **Settings → Domains & Routes → Add → Custom Domain** → `kosovadayasam.com` ekleyin.
   (İsterseniz `www.kosovadayasam.com`'u da ekleyin.)
3. Cloudflare DNS kaydını ve SSL sertifikasını otomatik oluşturur. Birkaç dakikada
   `https://kosovadayasam.com` yayında olur.

---

## Güncelleme

Kod değiştiğinde yeniden deploy:
```bash
npm run cf:deploy
```
Şema değiştiyse (yeni alan/tablo) `cloudflare/schema.sql`'i güncelleyip `npm run d1:schema`
ile uygulayın. Mevcut veriyi koruyan değişiklikler için `ALTER TABLE` kullanın.

## Alternatif: Panelden (Git ile) deploy

Terminal yerine Cloudflare panelinden de yapılabilir:
1. Dashboard → **Workers & Pages → Create → Import a repository** → bu repo + dalı seçin.
2. Build komutu: `npx opennextjs-cloudflare build` · Deploy komutu: `npx wrangler deploy`.
3. D1'i panelden oluşturup worker'a **DB** adıyla bind edin; `cloudflare/schema.sql` ve
   `cloudflare/seed.sql` içeriğini D1 konsoluna yapıştırarak uygulayın.
4. **Settings → Variables and Secrets** → `AUTH_SECRET` ekleyin.
5. 6. adımdaki gibi özel domaini bağlayın.

---

## Güvenlik kontrol listesi

- [ ] `AUTH_SECRET` güçlü ve yalnızca Worker secret'ı olarak saklı
- [ ] `wrangler.jsonc` içinde gerçek `database_id` var
- [ ] İlk girişten sonra admin şifresi değiştirildi
- [ ] Özel domain SSL'i aktif (`https://kosovadayasam.com`)

## Yerel geliştirme

Bkz. [README.md](./README.md) — `npm run cf:preview` + yerel D1.
