// Firma + ilk yönetici oluşturur (createCompanyAction ile aynı mantık, düz node).
// Env: COMPANY_NAME, COMPANY_SLUG, COMPANY_COLOR, COMPANY_CITY,
//      ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, COMPANY_LOCALE, COMPANY_STATUS
// İdempotent: slug zaten varsa dokunmaz.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(v) {
  return v.toLowerCase()
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const name = process.env.COMPANY_NAME;
const slug = slugify(process.env.COMPANY_SLUG || name || "");
const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || "";

async function main() {
  if (!name || !slug || !adminEmail || !adminPassword) {
    console.log("[create-company] Eksik env (COMPANY_NAME/ADMIN_EMAIL/ADMIN_PASSWORD) — atlanıyor.");
    return;
  }
  if (await prisma.company.findUnique({ where: { slug } })) {
    console.log(`[create-company] '${slug}' zaten var — değişiklik yok.`);
    return;
  }
  if (await prisma.user.findUnique({ where: { email: adminEmail } })) {
    console.log(`[create-company] '${adminEmail}' zaten kayıtlı — atlanıyor.`);
    return;
  }
  const locale = process.env.COMPANY_LOCALE || "sq";
  const company = await prisma.company.create({
    data: {
      name, slug,
      primaryColor: process.env.COMPANY_COLOR || "#2563eb",
      defaultLocale: locale,
      currency: "EUR",
      city: process.env.COMPANY_CITY || "Prishtinë",
      status: process.env.COMPANY_STATUS || "ACTIVE",
      users: {
        create: {
          name: process.env.ADMIN_NAME || "Yönetici",
          email: adminEmail,
          passwordHash: await bcrypt.hash(adminPassword, 10),
          role: "COMPANY_ADMIN",
          locale,
        },
      },
    },
  });
  console.log(`[create-company] Firma oluşturuldu: ${company.name} (/${company.slug})`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
