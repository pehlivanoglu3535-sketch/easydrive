// Cloudflare D1 için seed.sql üretir (admin + hizmet/blog/ekip).
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

const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
const now = Date.now(); // D1 tarih kolonları epoch-ms (INTEGER) saklar (Drizzle timestamp_ms)

const lines = [];
lines.push("-- ProKosova Solutions — Cloudflare D1 başlangıç verisi");
lines.push("-- Tarihler epoch-ms (INTEGER). Tabloların boş olduğundan emin olun.\n");

// Admin
const adminHash = await hashPassword(ADMIN_PASSWORD);
lines.push(
  `INSERT INTO "User" ("id","email","passwordHash","name","role","createdAt") VALUES (${q(randomUUID())},${q(ADMIN_EMAIL)},${q(adminHash)},${q(ADMIN_NAME)},'ADMIN',${now});`
);

// Services
for (const s of services) {
  lines.push(
    `INSERT INTO "Service" ("id","slug","title","summary","description","icon","features","order","published","createdAt","updatedAt") VALUES (${q(randomUUID())},${q(s.slug)},${q(s.title)},${q(s.summary)},${q(s.description)},${q(s.icon)},${q(s.features)},${s.order || 0},1,${now},${now});`
  );
}

// Posts
for (const p of posts) {
  lines.push(
    `INSERT INTO "Post" ("id","slug","title","excerpt","content","author","category","published","publishedAt","createdAt","updatedAt") VALUES (${q(randomUUID())},${q(p.slug)},${q(p.title)},${q(p.excerpt)},${q(p.content)},${q(p.author)},${q(p.category)},1,${now},${now},${now});`
  );
}

// Team
for (const m of team) {
  lines.push(
    `INSERT INTO "TeamMember" ("id","name","title","bio","order","email","createdAt") VALUES (${q(randomUUID())},${q(m.name)},${q(m.title)},${q(m.bio ?? "")},${m.order || 0},${q(m.email ?? "")},${now});`
  );
}

writeFileSync(join(outDir, "seed.sql"), lines.join("\n") + "\n", "utf-8");
console.log(`✅ cloudflare/seed.sql üretildi. Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
