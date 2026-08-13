import { prisma } from "@/lib/db";

/**
 * Bir custom domain'i (firmanın kendi domaini) firma slug'ına çevirir.
 * Middleware bunu kullanarak <özel-domain> → /s/<slug> eşlemesi yapar.
 */
export async function GET(req: Request) {
  const host = (new URL(req.url).searchParams.get("host") || "").toLowerCase().trim();
  if (!host) return Response.json({ slug: null });
  const company = await prisma.company.findUnique({
    where: { customDomain: host },
    select: { slug: true },
  });
  return Response.json({ slug: company?.slug ?? null });
}
