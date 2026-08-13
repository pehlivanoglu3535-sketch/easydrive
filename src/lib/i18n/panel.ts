import "server-only";
import { getPanelLocale, type PanelLocale } from "./panel-locale";
import { getPanelDict, type PanelDict } from "./panel-dict";

/** Panel için aktif dil + sözlük. */
export async function getPanelT(): Promise<{ locale: PanelLocale; t: PanelDict }> {
  const locale = await getPanelLocale();
  return { locale, t: getPanelDict(locale) };
}
