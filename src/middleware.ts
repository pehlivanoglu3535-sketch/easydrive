import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Firma subdomain'lerinin kök domaini. Domain değişirse burayı güncelleyin.
const ROOT_DOMAIN = "easydriveks.com";

/**
 * <firma>.easydriveks.com → /s/<firma> olarak yeniden yazar (rewrite).
 * Kök domain, www, yerel geliştirme ve IP erişimi olduğu gibi geçer.
 * /s/... yolu da doğrudan çalışmaya devam eder (yedek).
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").split(":")[0].toLowerCase();

  // www → kök domaine kalıcı yönlendirme (kanonik adres).
  if (host === `www.${ROOT_DOMAIN}`) {
    return NextResponse.redirect(
      `https://${ROOT_DOMAIN}${req.nextUrl.pathname}${req.nextUrl.search}`,
      308,
    );
  }

  // Kök / yerel / IP → dokunma.
  if (
    host === ROOT_DOMAIN ||
    host === "localhost" ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  ) {
    return NextResponse.next();
  }

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, host.length - ROOT_DOMAIN.length - 1);
    if (sub && sub !== "www") {
      const { pathname } = req.nextUrl;
      if (!pathname.startsWith("/s/") && !pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
        const url = req.nextUrl.clone();
        url.pathname = `/s/${sub}${pathname === "/" ? "" : pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Statik dosyalar, _next ve /api hariç her yolda çalışır.
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
