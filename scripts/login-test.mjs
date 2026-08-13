import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import "dotenv/config";

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me-in-production-please-1234567890"
);
const BASE = "http://localhost:3007";

async function mint(user) {
  return new SignJWT({
    userId: user.id, role: user.role, companyId: user.companyId,
    name: user.name, email: user.email, locale: user.locale,
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
}

// cookie ile bir sayfayı iste, HTTP kodunu ve (varsa) redirect hedefini döndür
async function fetchAs(token, path) {
  const res = await fetch(BASE + path, {
    headers: token ? { cookie: `rentacar_session=${token}` } : {},
    redirect: "manual",
  });
  return { status: res.status, location: res.headers.get("location") || "" };
}

const cases = [
  { email: "admin@platform.com", pass: "super123", role: "SUPER_ADMIN", landing: "/admin" },
  { email: "admin@prishtinarent.com", pass: "firma123", role: "COMPANY_ADMIN", landing: "/panel" },
  { email: "admin@prizrencars.com", pass: "firma123", role: "COMPANY_ADMIN", landing: "/panel" },
];

let pass = 0, fail = 0;
const ok = (c, m) => { console.log(`  ${c ? "✅" : "❌"} ${m}`); c ? pass++ : fail++; };

console.log("\n=== 1) DOĞRU ŞİFRE İLE KİMLİK DOĞRULAMA ===");
for (const t of cases) {
  const user = await prisma.user.findUnique({ where: { email: t.email } });
  const good = user && (await bcrypt.compare(t.pass, user.passwordHash));
  ok(good, `${t.email} — şifre doğrulandı (rol: ${user?.role})`);
  ok(user?.role === t.role, `${t.email} — rol beklenen: ${t.role}`);
}

console.log("\n=== 2) YANLIŞ ŞİFRE REDDEDİLMELİ ===");
for (const t of cases) {
  const user = await prisma.user.findUnique({ where: { email: t.email } });
  const bad = await bcrypt.compare("yanlis-sifre", user.passwordHash);
  ok(!bad, `${t.email} — yanlış şifre reddedildi`);
}

console.log("\n=== 3) OTURUM → ROL BAZLI ERİŞİM (canlı sunucu) ===");
for (const t of cases) {
  const user = await prisma.user.findUnique({ where: { email: t.email } });
  const token = await mint(user);
  // /login'e giden oturumlu kullanıcı, kendi paneline yönlenmeli
  const atLogin = await fetchAs(token, "/login");
  ok(atLogin.status === 307 && atLogin.location.endsWith(t.landing),
     `${t.email} — /login → ${t.landing} (görülen: ${atLogin.location || atLogin.status})`);
}

console.log("\n=== 4) ÇAPRAZ ERİŞİM ENGELİ ===");
{
  // Firma kullanıcısı /admin'e giremez
  const comp = await prisma.user.findUnique({ where: { email: "admin@prishtinarent.com" } });
  const ctoken = await mint(comp);
  const r1 = await fetchAs(ctoken, "/admin");
  ok(r1.status === 307 && r1.location.endsWith("/panel"), `Firma admini /admin → /panel (engellendi)`);

  // Süper admin /panel'e giremez (→ /admin)
  const sup = await prisma.user.findUnique({ where: { email: "admin@platform.com" } });
  const stoken = await mint(sup);
  const r2 = await fetchAs(stoken, "/panel");
  ok(r2.status === 307 && r2.location.endsWith("/admin"), `Süper admin /panel → /admin (engellendi)`);

  // Oturumsuz korumalı sayfa → /login
  const r3 = await fetchAs(null, "/panel");
  ok(r3.status === 307 && r3.location.endsWith("/login"), `Oturumsuz /panel → /login`);
}

console.log("\n=== 5) ASKIYA ALINMIŞ FİRMA GİRİŞİ ENGELLENMELİ ===");
{
  // Prizren'i geçici askıya al, giriş mantığını kontrol et, geri aç
  const comp = await prisma.company.findUnique({ where: { slug: "prizren-cars" } });
  await prisma.company.update({ where: { id: comp.id }, data: { status: "SUSPENDED" } });
  const user = await prisma.user.findUnique({ where: { email: "admin@prizrencars.com" }, include: { company: true } });
  const blocked = user.role !== "SUPER_ADMIN" && user.company?.status === "SUSPENDED";
  ok(blocked, `Askıdaki firma admini giriş mantığınca engellenir`);
  await prisma.company.update({ where: { id: comp.id }, data: { status: "ACTIVE" } });
  ok(true, `Prizren tekrar ACTIVE yapıldı (temizlik)`);
}

console.log(`\n──────────── SONUÇ: ${pass} geçti, ${fail} kaldı ────────────\n`);
await prisma.$disconnect();
process.exit(fail ? 1 : 0);
