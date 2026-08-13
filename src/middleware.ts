import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Firma subdomain'lerinin kök domaini. Domain değişirse burayı güncelleyin.
const ROOT_DOMAIN = "easydriveks.com";

// Custom domain → slug önbelleği (host bazlı, 60 sn TTL).
const domainCache = new Map<string, { slug: string | null; exp: number }>();

async function resolveCustomDomain(host: string, origin: string): Promise<string | null> {
  const cached = domainCache.get(host);
  if (cached && cached.exp > Date.now()) return cached.slug;
  let slug: string | null = null;
  try {
    const res = await fetch(`${origin}/api/resolve-host?host=${encodeURIComponent(host)}`);
    if (res.ok) slug = (await res.json())?.slug ?? null;
  } catch {
    slug = null;
  }
  domainCache.set(host, { slug, exp: Date.now() + 60_000 });
  return slug;
}

function rewriteToSite(req: NextRequest, slug: string) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = `/s/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

/**
 * <firma>.easydriveks.com  → /s/<firma>
 * <firmanın-kendi-domaini>  → /s/<firma>  (Seviye 2, DB'den çözülür)
 * www.easydriveks.com       → kök domaine 308
 * Kök / yerel / IP / /s / /api / _next → dokunma.
 */
export async function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();
  const { pathname } = req.nextUrl;

  // www → kök domaine kalıcı yönlendirme.
  if (host === `www.${ROOT_DOMAIN}`) {
    return NextResponse.redirect(`https://${ROOT_DOMAIN}${pathname}${req.nextUrl.search}`, 308);
  }

  // Kök / yerel / IP → dokunma.
  if (host === ROOT_DOMAIN || host === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return NextResponse.next();
  }

  const passthrough = pathname.startsWith("/s/") || pathname.startsWith("/api/") || pathname.startsWith("/_next/");

  // <firma>.easydriveks.com → /s/<firma>
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
    if (sub && sub !== "www" && !passthrough) return rewriteToSite(req, sub);
    return NextResponse.next();
  }

  // Custom domain (firmanın kendi domaini) → slug'a çöz → /s/<slug>
  if (!passthrough) {
    const slug = await resolveCustomDomain(host, req.nextUrl.origin);
    if (slug) return rewriteToSite(req, slug);
  }

  return NextResponse.next();
}

export const config = {
  // Statik dosyalar, _next ve /api hariç her yolda çalışır.
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
