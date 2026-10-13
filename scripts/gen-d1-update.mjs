// Canlı D1 veritabanındaki HİZMET içeriklerini güncellemek için UPDATE SQL üretir.
// Mevcut kayıtları slug ile eşleştirip summary/title/features/description/icon/order
// alanlarını günceller (veriyi silmeden). D1 web Console naif böldüğü için:
//  - her ifade TEK SATIR olur (newline'lar char(10) ile korunur),
//  - metin içindeki ';' virgüle çevrilir, ' karakteri '' olarak kaçırılır.
// Kullanım: node scripts/gen-d1-update.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { services } from "../cloudflare/seed-data.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "cloudflare");
mkdirSync(outDir, { recursive: true });

// Metni tek satırlık, Console-güvenli bir SQL değerine çevirir.
function S(v) {
  const parts = String(v).split("\n").map((p) => `'${p.replace(/;/g, ",").replace(/'/g, "''")}'`);
  return parts.length === 1 ? parts[0] : parts.join("||char(10)||");
}

const now = Date.now();

const lines = [];
for (const s of services) {
  lines.push(
    `UPDATE "Service" SET "title"=${S(s.title)},"summary"=${S(s.summary)},"description"=${S(s.description)},"icon"=${S(s.icon)},"features"=${S(s.features)},"order"=${s.order || 0},"updatedAt"=${now} WHERE "slug"=${S(s.slug)};`
  );
}

writeFileSync(join(outDir, "guncelle-hizmetler.sql"), lines.join("\n") + "\n", "utf-8");
console.log(`✅ cloudflare/guncelle-hizmetler.sql üretildi (${services.length} hizmet UPDATE).`);
