// Cloudflare D1 için seed.sql üretir (admin + hizmet/blog/ekip).
// D1 web Console çoklu ifadeyi ';' / satır sonuna göre naif böldüğü için:
//  - her ifade TEK SATIR olur (metindeki newline'lar char(10) ile korunur),
//  - metin içindeki ';' virgüle çevrilir (naif bölmeyi bozmasın),
//  - metindeki ' karakteri '' olarak kaçırılır.
// Şema DDL'i elle tutulan cloudflare/schema.sql dosyasındadır (schema.ts ile eşleşir).
// Kullanım: node --env-file=.env scripts/gen-d1-sql.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { services, posts, team } from "../cloudflare/seed-data.mjs";
import { hashPassword } from "../src/lib/password.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "cloudflare");
mkdirSync(outDir, { recursive: true });

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@prokosovasolutions.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "admin1234";
const ADMIN_NAME = process.env.ADMIN_NAME || "Site Yöneticisi";

// Metni tek satırlık, Console-güvenli bir SQL ifadesine çevirir.
// newline'lar char(10) ile korunur; iç ';' virgüle çevrilir; ' kaçırılır.
function S(v) {
  const parts = String(v).split("\n").map((p) => `'${p.replace(/;/g, ",").replace(/'/g, "''")}'`);
  return parts.length === 1 ? parts[0] : parts.join("||char(10)||");
}

const now = Date.now(); // D1 tarih kolonları epoch-ms (INTEGER)

const lines = [];
// Önce mevcut veriyi temizle (yeniden çalıştırılabilir olsun; FK için önce çocuk tablolar)
lines.push(`DELETE FROM "Appointment";`);
lines.push(`DELETE FROM "ContactMessage";`);
lines.push(`DELETE FROM "TeamMember";`);
lines.push(`DELETE FROM "Post";`);
lines.push(`DELETE FROM "Service";`);
lines.push(`DELETE FROM "User";`);

// Admin
const adminHash = await hashPassword(ADMIN_PASSWORD);
lines.push(
  `INSERT INTO "User" ("id","email","passwordHash","name","role","createdAt") VALUES (${S(randomUUID())},${S(ADMIN_EMAIL)},${S(adminHash)},${S(ADMIN_NAME)},'ADMIN',${now});`
);

// Services
for (const s of services) {
  lines.push(
    `INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES (${S(randomUUID())},${S(s.slug)},${S(s.title)},${S(s.summary)},${S(s.description)},${S(s.icon)},${S(s.features)},${s.order || 0},1,${now},${now});`
  );
}

// Posts
for (const p of posts) {
  lines.push(
    `INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES (${S(randomUUID())},${S(p.slug)},${S(p.title)},${S(p.excerpt)},${S(p.content)},${S(p.author)},${S(p.category)},1,${now},${now},${now});`
  );
}

// Team
for (const m of team) {
  lines.push(
    `INSERT INTO "TeamMember" ("id","name","title","bio","order","email","createdAt") VALUES (${S(randomUUID())},${S(m.name)},${S(m.title)},${S(m.bio ?? "")},${m.order || 0},${S(m.email ?? "")},${now});`
  );
}

writeFileSync(join(outDir, "seed.sql"), lines.join("\n") + "\n", "utf-8");
console.log(`✅ cloudflare/seed.sql üretildi (tek satırlık ifadeler). Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
