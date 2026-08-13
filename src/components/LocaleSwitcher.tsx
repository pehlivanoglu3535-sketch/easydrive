"use client";

import { usePathname } from "next/navigation";
import { setSiteLocaleAction } from "@/lib/actions/locale";
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS, type AppLocale } from "@/lib/i18n/config";

export function LocaleSwitcher({ current }: { current: AppLocale }) {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((loc) => (
        <form key={loc} action={setSiteLocaleAction}>
          <input type="hidden" name="locale" value={loc} />
          <input type="hidden" name="path" value={pathname} />
          <button
            type="submit"
            title={LOCALE_LABELS[loc]}
            aria-label={LOCALE_LABELS[loc]}
            className={`rounded-md px-2 py-1 text-lg leading-none transition ${
              current === loc ? "bg-white/25 ring-1 ring-white/50" : "opacity-70 hover:opacity-100"
            }`}
          >
            {LOCALE_FLAGS[loc]}
          </button>
        </form>
      ))}
    </div>
  );
}
