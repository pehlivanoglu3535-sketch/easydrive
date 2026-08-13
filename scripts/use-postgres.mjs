// Docker/production derlemesinde çağrılır: prisma/schema.prisma içindeki
// datasource provider'ını "sqlite" → "postgresql" yapar.
// Yerel geliştirme (Windows) SQLite'ta kalır; bu dosya committed schema'yı
// KALICI değiştirmez — yalnızca Docker imajı içindeki kopyayı düzenler.
import { readFileSync, writeFileSync } from "node:fs";

const path = "prisma/schema.prisma";
const src = readFileSync(path, "utf8");

if (src.includes('provider = "postgresql"')) {
  console.log("[use-postgres] Zaten postgresql — atlanıyor.");
  process.exit(0);
}

const out = src.replace('provider = "sqlite"', 'provider = "postgresql"');

if (out === src) {
  console.error('[use-postgres] HATA: datasource içinde provider = "sqlite" bulunamadı.');
  process.exit(1);
}

writeFileSync(path, out);
console.log("[use-postgres] datasource provider → postgresql");
