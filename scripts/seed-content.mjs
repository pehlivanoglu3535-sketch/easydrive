// Production başlangıç içeriği — düz node (tsx gerekmez; entrypoint'ten çağrılır).
// Yalnızca ilgili tablo BOŞSA içerik ekler; böylece panelden yapılan düzenlemeler
// yeniden deploy'da ezilmez. İçerik prisma/seed-data.mjs ile paylaşılır.
import { PrismaClient } from "@prisma/client";
import { services, posts, team } from "../prisma/seed-data.mjs";

const prisma = new PrismaClient();

try {
  const [serviceCount, postCount, teamCount] = await Promise.all([
    prisma.service.count(),
    prisma.post.count(),
    prisma.teamMember.count(),
  ]);

  if (serviceCount === 0) {
    for (const s of services) await prisma.service.create({ data: s });
    console.log(`[seed-content] ${services.length} hizmet eklendi.`);
  } else {
    console.log(`[seed-content] Hizmet tablosu dolu (${serviceCount}), atlandı.`);
  }

  if (postCount === 0) {
    for (const p of posts) await prisma.post.create({ data: p });
    console.log(`[seed-content] ${posts.length} blog yazısı eklendi.`);
  } else {
    console.log(`[seed-content] Blog tablosu dolu (${postCount}), atlandı.`);
  }

  if (teamCount === 0) {
    for (const m of team) await prisma.teamMember.create({ data: m });
    console.log(`[seed-content] ${team.length} ekip üyesi eklendi.`);
  } else {
    console.log(`[seed-content] Ekip tablosu dolu (${teamCount}), atlandı.`);
  }
} finally {
  await prisma.$disconnect();
}
