// İstemci + sunucu ortak — next/headers importu YOK.
export const PANEL_LOCALES = ["sq", "en", "tr"] as const;
export type PanelLocale = (typeof PANEL_LOCALES)[number];

export const PANEL_LOCALE_LABELS: Record<PanelLocale, string> = {
  sq: "SQ",
  en: "EN",
  tr: "TR",
};

export const PANEL_LOCALE_COOKIE = "panel_locale";

export function clampPanelLocale(v: string | undefined | null): PanelLocale | null {
  return v === "sq" || v === "en" || v === "tr" ? v : null;
}
