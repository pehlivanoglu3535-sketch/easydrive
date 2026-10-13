import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
// Başlangıç içeriği (hizmet/blog/ekip) — production seed'i ile paylaşılır.
import { services, posts, team } from "./seed-data.mjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@prokosovasolutions.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin1234";

async function main() {
  // Admin kullanıcı
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: { email: ADMIN_EMAIL, name: "Site Yöneticisi", passwordHash, role: "ADMIN" },
  });

  for (const s of services) {
    await prisma.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  }
  for (const p of posts) {
    await prisma.post.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  for (const m of team) {
    const existing = await prisma.teamMember.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.teamMember.update({ where: { id: existing.id }, data: m });
    } else {
      await prisma.teamMember.create({ data: m });
    }
  }

  console.log(`✅ Seed tamam. Admin girişi: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
