export const LOCALES = ["sq", "en", "sr", "tr"] as const;
export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "sq";

export const LOCALE_LABELS: Record<AppLocale, string> = {
  sq: "Shqip",
  en: "English",
  sr: "Srpski",
  tr: "Türkçe",
};

export const LOCALE_FLAGS: Record<AppLocale, string> = {
  sq: "🇦🇱",
  en: "🇬🇧",
  sr: "🇷🇸",
  tr: "🇹🇷",
};

export function isLocale(v: string | undefined | null): v is AppLocale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

export function coerceLocale(v: string | undefined | null): AppLocale {
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
