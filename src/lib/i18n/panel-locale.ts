import "server-only";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { PANEL_LOCALE_COOKIE, clampPanelLocale, type PanelLocale } from "./panel-locale-shared";

export type { PanelLocale };
export { PANEL_LOCALES, PANEL_LOCALE_LABELS, PANEL_LOCALE_COOKIE } from "./panel-locale-shared";

/** Panel dili: cookie → kullanıcı tercihi → tr. */
export async function getPanelLocale(): Promise<PanelLocale> {
  const store = await cookies();
  const fromCookie = clampPanelLocale(store.get(PANEL_LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const session = await getSession();
  return clampPanelLocale(session?.locale) ?? "tr";
}
