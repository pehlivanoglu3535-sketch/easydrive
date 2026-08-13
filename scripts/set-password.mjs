// Bir kullanıcının şifresini ayarlar (düz node). Env: EMAIL, NEW_PASSWORD.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = (process.env.EMAIL || "").toLowerCase();
const pass = process.env.NEW_PASSWORD || "";

async function main() {
  if (!email || !pass) { console.log("[set-password] EMAIL/NEW_PASSWORD gerekli."); return; }
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) { console.log(`[set-password] '${email}' bulunamadı.`); return; }
  await prisma.user.update({ where: { email }, data: { passwordHash: await bcrypt.hash(pass, 10) } });
  console.log(`[set-password] '${email}' şifresi güncellendi.`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
