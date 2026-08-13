// Production bootstrap: yalnızca SÜPER ADMIN kullanıcısını oluşturur (demo firma YOK).
// Düz node ile çalışır (tsx gerekmez) — @prisma/client ve bcryptjs prod bağımlılıkları.
// Env: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, (ops.) SUPER_ADMIN_NAME.
// İdempotent: kullanıcı varsa şifresini GÜNCELLEMEZ, sadece bilgi verir.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const email = process.env.SUPER_ADMIN_EMAIL;
const password = process.env.SUPER_ADMIN_PASSWORD;
const name = process.env.SUPER_ADMIN_NAME || "Platform Yöneticisi";

async function main() {
  if (!email || !password) {
    console.log("[create-admin] SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD yok — atlanıyor.");
    return;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[create-admin] '${email}' zaten mevcut — değişiklik yok.`);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name,
      role: "SUPER_ADMIN",
      locale: "tr",
    },
  });
  console.log(`[create-admin] Süper admin oluşturuldu: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
