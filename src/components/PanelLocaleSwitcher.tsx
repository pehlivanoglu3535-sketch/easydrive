"use client";

import { usePathname } from "next/navigation";
import { setPanelLocaleAction } from "@/lib/actions/panel-locale";
import { PANEL_LOCALES, PANEL_LOCALE_LABELS, type PanelLocale } from "@/lib/i18n/panel-locale-shared";

export function PanelLocaleSwitcher({ current }: { current: PanelLocale }) {
  const pathname = usePathname();
  return (
    <div className="flex items-center rounded-lg border bg-white p-0.5">
      {PANEL_LOCALES.map((loc) => (
        <form key={loc} action={setPanelLocaleAction}>
          <input type="hidden" name="locale" value={loc} />
          <input type="hidden" name="path" value={pathname} />
          <button
            type="submit"
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
              current === loc ? "bg-[var(--brand-600)] text-white" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {PANEL_LOCALE_LABELS[loc]}
          </button>
        </form>
      ))}
    </div>
  );
}
