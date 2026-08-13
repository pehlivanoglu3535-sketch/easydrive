import { prisma } from "@/lib/db";

// Firma subdomain'lerinin kök domaini (middleware ile aynı olmalı).
const ROOT_DOMAIN = "easydriveks.com";

/**
 * Caddy on-demand TLS "ask" ucu. Caddy, bir hostname için sertifika almadan önce
 * buraya ?domain=<host> ile sorar. Yalnızca kök/www ve GERÇEK firma subdomain'leri
 * için 200 döneriz — böylece rastgele subdomain'ler sertifika üretimini tetikleyemez.
 */
export async function GET(req: Request) {
  const domain = (new URL(req.url).searchParams.get("domain") || "").toLowerCase().trim();
  if (!domain) return new Response("no domain", { status: 400 });

  if (domain === ROOT_DOMAIN || domain === `www.${ROOT_DOMAIN}`) {
    return new Response("ok");
  }

  if (domain.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = domain.slice(0, domain.length - ROOT_DOMAIN.length - 1);
    if (sub && sub !== "www" && !sub.includes(".")) {
      const company = await prisma.company.findUnique({ where: { slug: sub }, select: { id: true } });
      if (company) return new Response("ok");
    }
  }

  return new Response("not allowed", { status: 403 });
}
