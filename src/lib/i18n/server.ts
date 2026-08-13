import "server-only";
import { cookies } from "next/headers";
import { coerceLocale, type AppLocale } from "./config";

const SITE_LOCALE_COOKIE = "site_locale";

/**
 * Müşteri sitesi için aktif dili belirler:
 * cookie varsa onu, yoksa firmanın varsayılan dilini kullanır.
 */
export async function getSiteLocale(defaultLocale: string): Promise<AppLocale> {
  const store = await cookies();
  const fromCookie = store.get(SITE_LOCALE_COOKIE)?.value;
  if (fromCookie) return coerceLocale(fromCookie);
  return coerceLocale(defaultLocale);
}

export { SITE_LOCALE_COOKIE };
