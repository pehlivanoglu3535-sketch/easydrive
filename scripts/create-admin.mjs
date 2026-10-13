// Production admin bootstrap: tek bir yönetici (ADMIN) kullanıcısı oluşturur.
// Düz node ile çalışır (tsx gerekmez) — @prisma/client ve bcryptjs prod bağımlılıkları.
// Env: ADMIN_EMAIL, ADMIN_PASSWORD, (ops.) ADMIN_NAME.
// İdempotent: kullanıcı varsa şifresini GÜNCELLEMEZ, yalnızca bilgi verir.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = (process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || "";
const name = process.env.ADMIN_NAME || "Site Yöneticisi";

if (!email || !password) {
  console.log("[create-admin] ADMIN_EMAIL / ADMIN_PASSWORD verilmedi, atlanıyor.");
  process.exit(0);
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[create-admin] Kullanıcı zaten var: ${email} (değişiklik yapılmadı).`);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { email, name, passwordHash, role: "ADMIN" } });
    console.log(`[create-admin] Yönetici oluşturuldu: ${email}`);
  }
} finally {
  await prisma.$disconnect();
}
